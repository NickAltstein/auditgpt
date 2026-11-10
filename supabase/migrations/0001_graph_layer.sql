-- ============================================================================
-- 0001_graph_layer.sql — idempotent migration that adds ONLY the graph-layer
-- tables / columns on top of an existing pre-graph Scrutexity schema.
-- Safe to run on a database that already has sites, scans, claims,
-- enforcement_patterns, users, agencies, verification_badges, api_keys.
-- ============================================================================

begin;

-- ─── new enums ──────────────────────────────────────────────────────────────
do $$ begin
  create type claim_type as enum (
    'treatment_claim','outcome_claim','trust_claim','comparative_claim','safe_factual'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type human_review_status as enum (
    'pending','approved','rejected','modified'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type evidence_status as enum (
    'unsupported','overstated','weak_evidence','supported'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type scan_status as enum (
    'processing','completed_pending_review','approved_for_delivery','failed','retention_expired'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_tier as enum (
    'free','guardian','enterprise','admin','reviewer'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type source_context as enum (
    'user_submitted',
    'seeded_public_index',
    'admin_imported',
    'free_snapshot'
  );
exception when duplicate_object then null; end $$;

-- ─── alter existing tables to add graph columns ─────────────────────────────
alter table users
  add column if not exists tier subscription_tier not null default 'free';

alter table sites
  add column if not exists vertical text,
  add column if not exists is_public boolean not null default false,
  add column if not exists deletion_requested_at timestamptz;

alter table enforcement_patterns
  add column if not exists slug text,
  add column if not exists source_context source_context not null default 'seeded_public_index',
  add column if not exists pinecone_id text unique,
  add column if not exists vertical text;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'enforcement_patterns_slug_unique'
  ) then
    alter table enforcement_patterns add constraint enforcement_patterns_slug_unique unique (slug);
  end if;
end $$;

alter table scans
  add column if not exists status scan_status not null default 'processing',
  add column if not exists source_context source_context not null default 'user_submitted',
  add column if not exists is_public boolean default false,
  add column if not exists extracted_text text,
  add column if not exists screenshot_url text,
  add column if not exists content_digest text,
  add column if not exists risk_level text,
  add column if not exists raw_scanner_output jsonb,
  add column if not exists claim_health_score integer,
  add column if not exists retention_expires_at timestamptz,
  add column if not exists inngest_run_id text,
  add column if not exists idempotency_key text unique,
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();
create index if not exists idx_scans_status on scans(status);
create index if not exists idx_scans_retention on scans(retention_expires_at) where retention_expires_at is not null;
create index if not exists idx_scans_idempotency on scans(idempotency_key);

alter table claims
  add column if not exists claim_type claim_type,
  add column if not exists evidence_status evidence_status,
  add column if not exists pattern_similarity real,
  add column if not exists risk_signal_strength integer not null default 0 check (risk_signal_strength between 0 and 100),
  add column if not exists evidence_gap text,
  add column if not exists safer_rewrite text,
  add column if not exists review_signal text,
  add column if not exists ai_distortion_excerpt text,
  add column if not exists ai_model text,
  add column if not exists distortion_flag boolean not null default false,
  add column if not exists human_review_status human_review_status not null default 'pending',
  add column if not exists reviewer_notes text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_claims_scan on claims(scan_id);
create index if not exists idx_claims_pattern on claims(pattern_id);
create index if not exists idx_claims_review_status on claims(human_review_status);
create index if not exists idx_claims_risk on claims(risk_signal_strength desc);
create index if not exists idx_claims_distortion on claims(distortion_flag) where distortion_flag = true;

-- ─── new tables (idempotent) ────────────────────────────────────────────────
create table if not exists claim_graph_vectors (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid not null references claims(id) on delete cascade,
  pattern_id uuid references enforcement_patterns(id) on delete set null,
  pinecone_id text not null unique,
  pinecone_namespace text not null default 'scrutexity-claims',
  similarity_score real,
  embedding_model text not null default 'text-embedding-3-small',
  embedding_dim integer not null default 1536,
  created_at timestamptz not null default now(),
  unique (claim_id)
);
create index if not exists idx_cgv_pattern on claim_graph_vectors(pattern_id);
create index if not exists idx_cgv_pinecone on claim_graph_vectors(pinecone_id);

create table if not exists distortion_logs (
  id uuid primary key default uuid_generate_v4(),
  scan_id uuid not null references scans(id) on delete cascade,
  claim_id uuid references claims(id) on delete set null,
  site_id uuid not null references sites(id) on delete cascade,
  ai_model text not null,
  prompt_hash text not null,
  response_excerpt text,
  source_excerpt text,
  flagged boolean not null default false,
  flag_reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_dl_scan on distortion_logs(scan_id);
create index if not exists idx_dl_site on distortion_logs(site_id);
create index if not exists idx_dl_flagged on distortion_logs(flagged) where flagged = true;
create index if not exists idx_dl_created on distortion_logs(created_at desc);

create table if not exists graph_aggregations (
  id uuid primary key default uuid_generate_v4(),
  scope text not null,
  scope_key text not null,
  period_start timestamptz,
  period_end timestamptz,
  scan_count integer not null default 0,
  claim_count integer not null default 0,
  high_signal_claim_count integer not null default 0,
  distortion_count integer not null default 0,
  avg_claim_health_score numeric(5,2),
  pattern_similarity_distribution jsonb,
  claim_type_distribution jsonb,
  computed_at timestamptz not null default now(),
  unique (scope, scope_key, period_start)
);
create index if not exists idx_ga_scope on graph_aggregations(scope, scope_key);

create table if not exists failed_scans (
  id uuid primary key default uuid_generate_v4(),
  scan_id uuid not null references scans(id) on delete cascade,
  inngest_run_id text,
  failure_stage text not null,
  error_message text not null,
  error_stack text,
  retry_count integer not null default 0,
  last_attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_fs_scan on failed_scans(scan_id);

create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_user_id uuid references users(id) on delete set null,
  actor_role text,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_actor on audit_log(actor_user_id);
create index if not exists idx_audit_created on audit_log(created_at desc);

-- ─── RLS — same as schema.sql; safe to re-run ───────────────────────────────
alter table sites                 enable row level security;
alter table scans                 enable row level security;
alter table claims                enable row level security;
alter table claim_graph_vectors   enable row level security;
alter table distortion_logs       enable row level security;
alter table graph_aggregations    enable row level security;
alter table failed_scans          enable row level security;
alter table verification_badges   enable row level security;
alter table api_keys              enable row level security;
alter table audit_log             enable row level security;
alter table enforcement_patterns  enable row level security;
alter table users                 enable row level security;
alter table agencies              enable row level security;

create or replace function current_app_user_id() returns uuid as $$
  select id from users where auth_user_id = auth.uid();
$$ language sql stable security definer;

create or replace function current_app_tier() returns subscription_tier as $$
  select tier from users where auth_user_id = auth.uid();
$$ language sql stable security definer;

create or replace function is_admin_or_reviewer() returns boolean as $$
  select current_app_tier() in ('admin', 'reviewer');
$$ language sql stable security definer;

-- (policies are idempotent via drop-if-exists pattern)
drop policy if exists "sites_select_owner_or_admin_or_public" on sites;
create policy "sites_select_owner_or_admin_or_public" on sites
  for select using (
       is_admin_or_reviewer()
    OR user_id = current_app_user_id()
    OR agency_id in (select agency_id from users where id = current_app_user_id())
    OR (is_public = true AND deletion_requested_at is null)
  );

drop policy if exists "scans_select_owner_or_admin" on scans;
create policy "scans_select_owner_or_admin" on scans
  for select using (
       is_admin_or_reviewer()
    OR user_id = current_app_user_id()
    OR initiated_by_user_id = current_app_user_id()
    OR site_id in (select id from sites where user_id = current_app_user_id()
                    OR agency_id in (select agency_id from users where id = current_app_user_id()))
  );

drop policy if exists "claims_select_owner_or_admin" on claims;
create policy "claims_select_owner_or_admin" on claims
  for select using (
       is_admin_or_reviewer()
    OR scan_id in (select id from scans where user_id = current_app_user_id()
                    OR initiated_by_user_id = current_app_user_id()
                    OR site_id in (select id from sites where user_id = current_app_user_id()))
  );

drop policy if exists "claims_update_admin_or_reviewer" on claims;
create policy "claims_update_admin_or_reviewer" on claims
  for update using (is_admin_or_reviewer());

drop policy if exists "cgv_select_owner_or_admin" on claim_graph_vectors;
create policy "cgv_select_owner_or_admin" on claim_graph_vectors
  for select using (
       is_admin_or_reviewer()
    OR claim_id in (select c.id from claims c
                    join scans s on s.id = c.scan_id
                    where s.user_id = current_app_user_id()
                       OR s.site_id in (select id from sites where user_id = current_app_user_id()))
  );

drop policy if exists "dl_select_owner_or_admin" on distortion_logs;
create policy "dl_select_owner_or_admin" on distortion_logs
  for select using (
       is_admin_or_reviewer()
    OR scan_id in (select id from scans where user_id = current_app_user_id()
                    OR site_id in (select id from sites where user_id = current_app_user_id()))
  );

drop policy if exists "ga_select_public" on graph_aggregations;
create policy "ga_select_public" on graph_aggregations
  for select using (true);

drop policy if exists "fs_admin_only" on failed_scans;
create policy "fs_admin_only" on failed_scans
  for all using (is_admin_or_reviewer()) with check (is_admin_or_reviewer());

drop policy if exists "audit_admin_read" on audit_log;
create policy "audit_admin_read" on audit_log
  for select using (is_admin_or_reviewer());

drop policy if exists "audit_service_write" on audit_log;
create policy "audit_service_write" on audit_log
  for insert with check (true);

-- ─── helper function ────────────────────────────────────────────────────────
create or replace function maybe_approve_scan(p_scan_id uuid)
returns scan_status as $$
declare v_status scan_status; v_pending_count integer;
begin
  select count(*) into v_pending_count
  from claims where scan_id = p_scan_id and human_review_status = 'pending';
  if v_pending_count = 0 then
    update scans set status = 'approved_for_delivery', completed_at = now()
      where id = p_scan_id returning status into v_status;
  else
    select status into v_status from scans where id = p_scan_id;
  end if;
  return v_status;
end;
$$ language plpgsql security definer;

commit;
