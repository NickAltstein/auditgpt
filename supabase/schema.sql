-- ============================================================================
-- Scrutexity — supabase/schema.sql
-- Existing hardened schema + Claim Graph layer extensions + RLS
-- Idempotent: safe to re-run.
-- ============================================================================

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- Enums
-- ============================================================================
do $$ begin
  create type claim_type as enum (
    'treatment_claim',
    'outcome_claim',
    'trust_claim',
    'comparative_claim',
    'safe_factual'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type human_review_status as enum (
    'pending',
    'approved',
    'rejected',
    'modified'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type evidence_status as enum (
    'unsupported',
    'overstated',
    'weak_evidence',
    'supported'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type scan_status as enum (
    'processing',
    'completed_pending_review',
    'approved_for_delivery',
    'failed',
    'retention_expired'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_tier as enum ('free', 'guardian', 'enterprise', 'admin', 'reviewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type source_context as enum (
    'user_submitted',
    'seeded_public_index',
    'admin_imported',
    'free_snapshot'
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- agencies / users
-- ============================================================================
create table if not exists agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique not null,        -- maps to supabase auth.users.id
  email text not null,
  agency_id uuid references agencies(id) on delete set null,
  tier subscription_tier not null default 'free',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- sites
-- ============================================================================
create table if not exists sites (
  id uuid primary key default uuid_generate_v4(),
  domain text not null unique,
  user_id uuid references users(id) on delete set null,
  agency_id uuid references agencies(id) on delete set null,
  vertical text,                             -- e.g. "glp-1", "skincare", "supplements"
  is_public boolean not null default false,
  deletion_requested_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_sites_user on sites(user_id);
create index if not exists idx_sites_agency on sites(agency_id);
create index if not exists idx_sites_public on sites(is_public) where is_public = true;

-- ============================================================================
-- enforcement_patterns  (18 FDA/FTC paraphrased patterns)
-- ============================================================================
create table if not exists enforcement_patterns (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text not null,                 -- paraphrased, not verbatim
  vertical text,
  source_context source_context not null default 'seeded_public_index',
  pinecone_id text unique,                   -- Pinecone vector id for this pattern's description embedding
  created_at timestamptz not null default now()
);
create index if not exists idx_patterns_vertical on enforcement_patterns(vertical);

-- ============================================================================
-- scans
-- ============================================================================
create table if not exists scans (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  initiated_by_user_id uuid references users(id) on delete set null,
  status scan_status not null default 'processing',
  source_context source_context not null default 'user_submitted',
  is_public boolean default false,
  extracted_text text,
  screenshot_url text,
  content_digest text,
  risk_level text,
  raw_scanner_output jsonb,                  -- raw AI analysis payload (kept for replay)
  claim_health_score integer,                -- 0-100, computed by computeClaimHealthScore
  retention_expires_at timestamptz,          -- free tier: 90d; guardian: 2y; enterprise: null
  inngest_run_id text,
  idempotency_key text unique,               -- allows safe retry of /api/scan
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_scans_site on scans(site_id);
create index if not exists idx_scans_status on scans(status);
create index if not exists idx_scans_user on scans(user_id);
create index if not exists idx_scans_retention on scans(retention_expires_at) where retention_expires_at is not null;

-- ============================================================================
-- claims  (graph-ready, extended)
-- ============================================================================
create table if not exists claims (
  id uuid primary key default uuid_generate_v4(),
  scan_id uuid not null references scans(id) on delete cascade,
  site_id uuid not null references sites(id) on delete cascade,

  claim_text text not null,                  -- original exact text from page
  claim_type claim_type not null,
  evidence_status evidence_status,           -- used by claim_health_score

  pattern_id uuid references enforcement_patterns(id) on delete set null,
  pattern_similarity real,                   -- 0..1 cosine similarity to matched pattern

  -- Legal-safe preview fields (never use "score"/"violation" terminology)
  risk_signal_strength integer not null default 0 check (risk_signal_strength between 0 and 100),
  evidence_gap text,                         -- what substantiation is missing
  safer_rewrite text,                        -- suggested alternative language
  review_signal text,                        -- human-readable preview note (NOT "violation")

  -- AI distortion tracking
  ai_distortion_excerpt text,
  ai_model text,
  distortion_flag boolean not null default false,

  -- Human review
  human_review_status human_review_status not null default 'pending',
  reviewer_notes text,
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_claims_scan on claims(scan_id);
create index if not exists idx_claims_site on claims(site_id);
create index if not exists idx_claims_pattern on claims(pattern_id);
create index if not exists idx_claims_review_status on claims(human_review_status);
create index if not exists idx_claims_risk on claims(risk_signal_strength desc);
create index if not exists idx_claims_distortion on claims(distortion_flag) where distortion_flag = true;

-- ============================================================================
-- claim_graph_vectors  (METADATA ONLY — vectors live in Pinecone)
-- ============================================================================
create table if not exists claim_graph_vectors (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid not null references claims(id) on delete cascade,
  pattern_id uuid references enforcement_patterns(id) on delete set null,
  pinecone_id text not null unique,          -- the vector id in Pinecone namespace scrutexity-claims
  pinecone_namespace text not null default 'scrutexity-claims',
  similarity_score real,                     -- cached cosine sim to the matched pattern
  embedding_model text not null default 'text-embedding-3-small',
  embedding_dim integer not null default 1536,
  created_at timestamptz not null default now(),
  unique (claim_id)
);
create index if not exists idx_cgv_pattern on claim_graph_vectors(pattern_id);
create index if not exists idx_cgv_pinecone on claim_graph_vectors(pinecone_id);

-- ============================================================================
-- distortion_logs  (one row per AI distortion probe)
-- ============================================================================
create table if not exists distortion_logs (
  id uuid primary key default uuid_generate_v4(),
  scan_id uuid not null references scans(id) on delete cascade,
  claim_id uuid references claims(id) on delete set null,
  site_id uuid not null references sites(id) on delete cascade,
  ai_model text not null,                    -- e.g. "chatgpt-4o", "gemini-1.5-pro", "perplexity-sonar"
  prompt_hash text not null,                 -- sha256 of the prompt — never store raw prompt PII
  response_excerpt text,                     -- what the model actually said
  source_excerpt text,                       -- what the page actually said
  flagged boolean not null default false,
  flag_reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_dl_scan on distortion_logs(scan_id);
create index if not exists idx_dl_site on distortion_logs(site_id);
create index if not exists idx_dl_flagged on distortion_logs(flagged) where flagged = true;
create index if not exists idx_dl_created on distortion_logs(created_at desc);

-- ============================================================================
-- graph_aggregations  (materialized / cached stats per domain/vertical/pattern)
-- ============================================================================
create table if not exists graph_aggregations (
  id uuid primary key default uuid_generate_v4(),
  scope text not null,                       -- 'domain' | 'vertical' | 'pattern'
  scope_key text not null,                   -- the domain, vertical slug, or pattern slug
  period_start timestamptz,
  period_end timestamptz,
  scan_count integer not null default 0,
  claim_count integer not null default 0,
  high_signal_claim_count integer not null default 0,  -- risk_signal_strength >= 70
  distortion_count integer not null default 0,
  avg_claim_health_score numeric(5,2),
  pattern_similarity_distribution jsonb,     -- { pattern_slug: count, ... }
  claim_type_distribution jsonb,             -- { treatment_claim: 12, ... }
  computed_at timestamptz not null default now(),
  unique (scope, scope_key, period_start)
);
create index if not exists idx_ga_scope on graph_aggregations(scope, scope_key);
create index if not exists idx_ga_computed on graph_aggregations(computed_at desc);

-- ============================================================================
-- failed_scans  (Inngest dead-letter target after 3 retries)
-- ============================================================================
create table if not exists failed_scans (
  id uuid primary key default uuid_generate_v4(),
  scan_id uuid not null references scans(id) on delete cascade,
  inngest_run_id text,
  failure_stage text not null,               -- 'crawl' | 'extract' | 'embed' | 'persist' | 'score'
  error_message text not null,
  error_stack text,
  retry_count integer not null default 0,
  last_attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_fs_scan on failed_scans(scan_id);

-- ============================================================================
-- verification_badges  (S-Mark)
-- ============================================================================
create table if not exists verification_badges (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  code text not null unique,                 -- the verified.scrutexity.com/{code} slug
  receipt_id text,                           -- generateReceipt output id
  latest_approved_scan_id uuid references scans(id) on delete set null,
  subscription_active boolean not null default false,
  status text not null default 'review_record_expired',
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vb_site on verification_badges(site_id);
create index if not exists idx_vb_code on verification_badges(code);

-- ============================================================================
-- api_keys  (developer API auth)
-- ============================================================================
create table if not exists api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  key_hash text not null unique,             -- sha256(secret) — never store raw
  key_prefix text not null,                  -- first 8 chars for UI display
  label text,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_apikeys_user on api_keys(user_id);
create index if not exists idx_apikeys_hash on api_keys(key_hash);

-- ============================================================================
-- audit_log  (admin/reviewer access to retention-expired data, etc.)
-- ============================================================================
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

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_scans_updated on scans;
create trigger trg_scans_updated before update on scans
  for each row execute function touch_updated_at();

drop trigger if exists trg_claims_updated on claims;
create trigger trg_claims_updated before update on claims
  for each row execute function touch_updated_at();

drop trigger if exists trg_vb_updated on verification_badges;
create trigger trg_vb_updated before update on verification_badges
  for each row execute function touch_updated_at();

-- ============================================================================
-- RLS — enable everywhere
-- ============================================================================
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

-- ============================================================================
-- Helper: is the current role an admin/reviewer service account?
-- Service role bypasses RLS by default; this is for *user* JWTs that carry
-- tier = admin | reviewer in users.tier (joined via auth.users).
-- ============================================================================
create or replace function current_app_user_id() returns uuid as $$
  select id from users where auth_user_id = auth.uid();
$$ language sql stable security definer;

create or replace function current_app_tier() returns subscription_tier as $$
  select tier from users where auth_user_id = auth.uid();
$$ language sql stable security definer;

create or replace function is_admin_or_reviewer() returns boolean as $$
  select current_app_tier() in ('admin', 'reviewer');
$$ language sql stable security definer;

-- ============================================================================
-- RLS — sites
-- Owner (user_id) OR agency member OR admin/reviewer OR public (is_public=true
-- AND no active deletion request — readable but only via the anonymized view).
-- ============================================================================
drop policy if exists "sites_select_owner_or_admin_or_public" on sites;
create policy "sites_select_owner_or_admin_or_public" on sites
  for select using (
       is_admin_or_reviewer()
    OR user_id = current_app_user_id()
    OR agency_id in (select agency_id from users where id = current_app_user_id())
    OR (is_public = true AND deletion_requested_at is null)
  );

drop policy if exists "sites_insert_owner" on sites;
create policy "sites_insert_owner" on sites
  for insert with check (user_id = current_app_user_id() OR is_admin_or_reviewer());

drop policy if exists "sites_update_owner_or_admin" on sites;
create policy "sites_update_owner_or_admin" on sites
  for update using (user_id = current_app_user_id() OR is_admin_or_reviewer());

-- ============================================================================
-- RLS — scans
-- Owner (user_id or initiated_by_user_id) OR admin/reviewer.
-- (Retention filtering happens in app-level queries, not here — RLS is about
--  identity, not retention expiry.)
-- ============================================================================
drop policy if exists "scans_select_owner_or_admin" on scans;
create policy "scans_select_owner_or_admin" on scans
  for select using (
       is_admin_or_reviewer()
    OR user_id = current_app_user_id()
    OR initiated_by_user_id = current_app_user_id()
    OR site_id in (
          select id from sites
          where user_id = current_app_user_id()
             OR agency_id in (select agency_id from users where id = current_app_user_id())
       )
  );

drop policy if exists "scans_insert_owner" on scans;
create policy "scans_insert_owner" on scans
  for insert with check (
       initiated_by_user_id = current_app_user_id()
    OR user_id = current_app_user_id()
    OR is_admin_or_reviewer()
  );

drop policy if exists "scans_update_owner_or_admin" on scans;
create policy "scans_update_owner_or_admin" on scans
  for update using (is_admin_or_reviewer() OR user_id = current_app_user_id());

-- ============================================================================
-- RLS — claims
-- Same ownership chain as scans (claims inherit site/scan ownership).
-- ============================================================================
drop policy if exists "claims_select_owner_or_admin" on claims;
create policy "claims_select_owner_or_admin" on claims
  for select using (
       is_admin_or_reviewer()
    OR scan_id in (
        select id from scans
        where user_id = current_app_user_id()
           OR initiated_by_user_id = current_app_user_id()
           OR site_id in (select id from sites where user_id = current_app_user_id())
       )
  );

drop policy if exists "claims_insert_owner_or_admin" on claims;
create policy "claims_insert_owner_or_admin" on claims
  for insert with check (
       is_admin_or_reviewer()
    OR scan_id in (
        select id from scans
        where user_id = current_app_user_id()
           OR initiated_by_user_id = current_app_user_id()
       )
  );

drop policy if exists "claims_update_admin_or_reviewer" on claims;
-- Only admins/reviewers flip human_review_status (POST /v1/graph/internal/review).
create policy "claims_update_admin_or_reviewer" on claims
  for update using (is_admin_or_reviewer());

-- ============================================================================
-- RLS — claim_graph_vectors  (mirror claims)
-- ============================================================================
drop policy if exists "cgv_select_owner_or_admin" on claim_graph_vectors;
create policy "cgv_select_owner_or_admin" on claim_graph_vectors
  for select using (
       is_admin_or_reviewer()
    OR claim_id in (
        select c.id from claims c
        join scans s on s.id = c.scan_id
        where s.user_id = current_app_user_id()
           OR s.site_id in (select id from sites where user_id = current_app_user_id())
       )
  );

drop policy if exists "cgv_insert_owner_or_admin" on claim_graph_vectors;
create policy "cgv_insert_owner_or_admin" on claim_graph_vectors
  for insert with check (is_admin_or_reviewer());

drop policy if exists "cgv_delete_admin" on claim_graph_vectors;
create policy "cgv_delete_admin" on claim_graph_vectors
  for delete using (is_admin_or_reviewer());

-- ============================================================================
-- RLS — distortion_logs  (mirror scans)
-- ============================================================================
drop policy if exists "dl_select_owner_or_admin" on distortion_logs;
create policy "dl_select_owner_or_admin" on distortion_logs
  for select using (
       is_admin_or_reviewer()
    OR scan_id in (
        select id from scans
        where user_id = current_app_user_id()
           OR initiated_by_user_id = current_app_user_id()
           OR site_id in (select id from sites where user_id = current_app_user_id())
       )
  );

drop policy if exists "dl_insert_owner_or_admin" on distortion_logs;
create policy "dl_insert_owner_or_admin" on distortion_logs
  for insert with check (is_admin_or_reviewer());

-- ============================================================================
-- RLS — graph_aggregations  (public-readable; pre-aggregated, no PII)
-- ============================================================================
drop policy if exists "ga_select_public" on graph_aggregations;
create policy "ga_select_public" on graph_aggregations
  for select using (true);

drop policy if exists "ga_insert_admin" on graph_aggregations;
create policy "ga_insert_admin" on graph_aggregations
  for insert with check (is_admin_or_reviewer());

drop policy if exists "ga_update_admin" on graph_aggregations;
create policy "ga_update_admin" on graph_aggregations
  for update using (is_admin_or_reviewer());

drop policy if exists "ga_delete_admin" on graph_aggregations;
create policy "ga_delete_admin" on graph_aggregations
  for delete using (is_admin_or_reviewer());

-- ============================================================================
-- RLS — enforcement_patterns  (public-readable)
-- ============================================================================
drop policy if exists "ep_select_public" on enforcement_patterns;
create policy "ep_select_public" on enforcement_patterns
  for select using (true);

drop policy if exists "ep_insert_admin" on enforcement_patterns;
create policy "ep_insert_admin" on enforcement_patterns
  for insert with check (is_admin_or_reviewer());

drop policy if exists "ep_update_admin" on enforcement_patterns;
create policy "ep_update_admin" on enforcement_patterns
  for update using (is_admin_or_reviewer());

-- ============================================================================
-- RLS — failed_scans  (admin only)
-- ============================================================================
drop policy if exists "fs_admin_only" on failed_scans;
create policy "fs_admin_only" on failed_scans
  for all using (is_admin_or_reviewer()) with check (is_admin_or_reviewer());

-- ============================================================================
-- RLS — verification_badges
-- Site owner OR admin OR public (the badge page is public by design).
-- ============================================================================
drop policy if exists "vb_select_owner_or_admin_or_public" on verification_badges;
create policy "vb_select_owner_or_admin_or_public" on verification_badges
  for select using (
       is_admin_or_reviewer()
    OR site_id in (select id from sites where user_id = current_app_user_id())
    OR true  -- S-Mark verification page is public
  );

drop policy if exists "vb_insert_admin" on verification_badges;
create policy "vb_insert_admin" on verification_badges
  for insert with check (is_admin_or_reviewer());

drop policy if exists "vb_update_admin" on verification_badges;
create policy "vb_update_admin" on verification_badges
  for update using (is_admin_or_reviewer());

-- ============================================================================
-- RLS — api_keys  (owner only)
-- ============================================================================
drop policy if exists "ak_owner_only" on api_keys;
create policy "ak_owner_only" on api_keys
  for all using (user_id = current_app_user_id()) with check (user_id = current_app_user_id());

-- ============================================================================
-- RLS — audit_log  (admin only read; service role writes)
-- ============================================================================
drop policy if exists "audit_admin_read" on audit_log;
create policy "audit_admin_read" on audit_log
  for select using (is_admin_or_reviewer());

drop policy if exists "audit_service_write" on audit_log;
create policy "audit_service_write" on audit_log
  for insert with check (true);

-- ============================================================================
-- RLS — users / agencies
-- ============================================================================
drop policy if exists "users_self_or_admin" on users;
create policy "users_self_or_admin" on users
  for select using (id = current_app_user_id() OR is_admin_or_reviewer());

drop policy if exists "users_update_self" on users;
create policy "users_update_self" on users
  for update using (id = current_app_user_id() OR is_admin_or_reviewer());

drop policy if exists "agencies_member_or_admin" on agencies;
create policy "agencies_member_or_admin" on agencies
  for select using (
       is_admin_or_reviewer()
    OR id in (select agency_id from users where id = current_app_user_id())
  );

-- ============================================================================
-- Public anonymized view — for risk-index & competitor-comparison endpoints
-- that must NOT leak domain names. Joins to sites; masks domain.
-- ============================================================================
create or replace view public_graph_signals
with (security_invoker = true)
as
select
  s.id as site_id,
  case
    when s.is_public = true and s.deletion_requested_at is null then s.domain
    else 'domain-redacted-' || encode(
           hmac(convert_to(s.domain, 'utf8'),
                convert_to(current_setting('app.anon_hash_secret', true), 'utf8'),
                'sha256'),
           'hex')
  end as domain_display,
  s.is_public,
  s.vertical,
  c.claim_type,
  count(*) as claim_count,
  avg(c.risk_signal_strength)::int as avg_risk_signal_strength
from sites s
join scans sc on sc.site_id = s.id
join claims c on c.scan_id = sc.id
where sc.status in ('completed_pending_review', 'approved_for_delivery')
  and (sc.retention_expires_at is null or sc.retention_expires_at > now())
group by s.id, s.domain, s.is_public, s.vertical, c.claim_type;

-- ============================================================================
-- Function: move a scan to approved_for_delivery iff all claims reviewed
-- ============================================================================
create or replace function maybe_approve_scan(p_scan_id uuid)
returns scan_status as $$
declare
  v_status scan_status;
  v_pending_count integer;
begin
  select count(*) into v_pending_count
  from claims
  where scan_id = p_scan_id
    and human_review_status = 'pending';

  if v_pending_count = 0 then
    update scans set status = 'approved_for_delivery', completed_at = now()
      where id = p_scan_id returning status into v_status;
  else
    select status into v_status from scans where id = p_scan_id;
  end if;

  return v_status;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- HARDENING LAYER (0002_hardening.sql inline) — §3 Security, §4 Data Quality,
-- §6 Deletion Requests, §7 Soft Delete + Cold Archive
-- ============================================================================

-- §3: api_keys.scopes
alter table api_keys
  add column if not exists scopes jsonb not null default '["graph:read"]'::jsonb;
create index if not exists idx_apikeys_scopes on api_keys using gin (scopes);

-- §3: audit_log new columns
alter table audit_log
  add column if not exists table_name text,
  add column if not exists record_id text,
  add column if not exists old_values jsonb,
  add column if not exists new_values jsonb;
update audit_log set table_name = resource_type where table_name is null and resource_type is not null;

-- §3: audit triggers
create or replace function audit_trigger_fn() returns trigger as $$
declare v_old jsonb; v_new jsonb;
begin
  v_old := case when TG_OP in ('DELETE','UPDATE') then to_jsonb(old) else null end;
  v_new := case when TG_OP in ('INSERT','UPDATE') then to_jsonb(new) else null end;
  insert into audit_log (action, table_name, record_id, old_values, new_values, metadata, created_at)
  values (TG_OP::text, TG_TABLE_NAME,
    coalesce(case when v_new is not null then v_new->>'id' end,
             case when v_old is not null then v_old->>'id' end),
    v_old, v_new, jsonb_build_object('op', TG_OP, 'table', TG_TABLE_NAME), now());
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists trg_audit_claims on claims;
create trigger trg_audit_claims after insert or update or delete on claims
  for each row execute function audit_trigger_fn();
drop trigger if exists trg_audit_scans on scans;
create trigger trg_audit_scans after insert or update or delete on scans
  for each row execute function audit_trigger_fn();
drop trigger if exists trg_audit_verification_badges on verification_badges;
create trigger trg_audit_verification_badges after insert or update or delete on verification_badges
  for each row execute function audit_trigger_fn();
drop trigger if exists trg_audit_api_keys on api_keys;
create trigger trg_audit_api_keys after insert or update or delete on api_keys
  for each row execute function audit_trigger_fn();

-- §4: claims dedup + confidence
alter table claims
  add column if not exists claim_text_normalized text,
  add column if not exists claim_text_hash text,
  add column if not exists duplicate_count integer not null default 0,
  add column if not exists classification_confidence real;
create index if not exists idx_claims_hash on claims(claim_text_hash);
create index if not exists idx_claims_confidence on claims(classification_confidence) where classification_confidence is not null;

-- §4: enforcement_patterns freshness
alter table enforcement_patterns
  add column if not exists last_enforced_date date,
  add column if not exists active boolean not null default true,
  add column if not exists enforcement_count integer not null default 0;
create index if not exists idx_patterns_active on enforcement_patterns(active) where active = true;
create index if not exists idx_patterns_last_enforced on enforcement_patterns(last_enforced_date);

-- §4: claims_archive (cold storage)
create table if not exists claims_archive (
  id uuid primary key,
  scan_id uuid not null,
  site_id uuid not null,
  claim_text text,
  claim_text_normalized text,
  claim_text_hash text,
  claim_type claim_type,
  evidence_status evidence_status,
  pattern_id uuid,
  pattern_similarity real,
  risk_signal_strength integer,
  evidence_gap text,
  safer_rewrite text,
  review_signal text,
  ai_distortion_excerpt text,
  ai_model text,
  distortion_flag boolean,
  human_review_status human_review_status,
  reviewer_notes text,
  classification_confidence real,
  duplicate_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz not null default now()
);
create index if not exists idx_claims_archive_scan on claims_archive(scan_id);
create index if not exists idx_claims_archive_site on claims_archive(site_id);
alter table claims_archive enable row level security;
drop policy if exists "claims_archive_admin_only" on claims_archive;
create policy "claims_archive_admin_only" on claims_archive
  for all using (is_admin_or_reviewer()) with check (is_admin_or_reviewer());

-- §6: deletion_requests
create table if not exists deletion_requests (
  id uuid primary key default uuid_generate_v4(),
  domain text not null,
  site_id uuid references sites(id) on delete set null,
  requester_email text not null,
  requester_name text,
  reason text,
  status text not null default 'open',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dr_domain on deletion_requests(domain);
create index if not exists idx_dr_status on deletion_requests(status);
alter table deletion_requests enable row level security;
drop policy if exists "dr_insert_anyone" on deletion_requests;
create policy "dr_insert_anyone" on deletion_requests for insert with check (true);
drop policy if exists "dr_select_admin_or_self" on deletion_requests;
create policy "dr_select_admin_or_self" on deletion_requests
  for select using (is_admin_or_reviewer());
drop policy if exists "dr_update_admin" on deletion_requests;
create policy "dr_update_admin" on deletion_requests
  for update using (is_admin_or_reviewer());

-- §7: scans.deleted_at (soft delete)
alter table scans
  add column if not exists deleted_at timestamptz;
create index if not exists idx_scans_deleted on scans(deleted_at) where deleted_at is not null;

-- ============================================================================
-- Done.
-- ============================================================================
