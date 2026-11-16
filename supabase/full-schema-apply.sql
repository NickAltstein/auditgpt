-- ===== PREFLIGHT: legacy scans rename (guarded) =====
-- ============================================================================
-- 000_preflight_legacy_rename.sql  (prepend to full-schema-apply.sql)
-- This project (rktymhkgrhuuymetmpyf) contains AuditGPT-era tables. Its
-- `scans` table (email/full_package/purchased_at/provenance_hash/...) is a
-- DIFFERENT data model from the Scrutexity claim-graph `scans`
-- (site_id/user_id/status/is_public/extracted_text/...). schema.sql's
-- `create table if not exists scans` would SKIP over it, leaving the API
-- broken on insert.
-- Fix: rename the legacy table (data preserved) ONLY when it is the old
-- shape (lacks site_id). Idempotent + reversible.
-- ============================================================================
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'scans')
     and not exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'scans' and column_name = 'site_id') then
    alter table public.scans rename to scans_auditgpt_legacy;
    raise notice 'renamed legacy scans -> scans_auditgpt_legacy';
  end if;
end $$;

-- ===== BASE: supabase/schema.sql =====
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

-- ===== MIGRATION 0001 =====
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
    'user_submitted','seeded_public_index','admin_imported'
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

-- ===== MIGRATION 0002 =====
-- ============================================================================
-- 0002_hardening.sql — Claim Graph hardening layer
-- Adds:
--   §3  api_keys.scopes (jsonb)
--        audit_log triggers on claims/scans/verification_badges/api_keys
--   §4  claims.claim_text_normalized, claims.claim_text_hash, claims.duplicate_count
--        claims.classification_confidence
--        enforcement_patterns.last_enforced_date, enforcement_patterns.active
--        claims_archive (cold storage for guardian >2y)
--   §6  deletion_requests table
--   §7  scans.deleted_at (soft delete)
-- ============================================================================

begin;

-- ─── §3: api_keys.scopes ────────────────────────────────────────────────────
alter table api_keys
  add column if not exists scopes jsonb not null default '["graph:read"]'::jsonb;
create index if not exists idx_apikeys_scopes on api_keys using gin (scopes);

-- ─── §3: audit_log new columns (old_values / new_values) ────────────────────
alter table audit_log
  add column if not exists table_name text,
  add column if not exists record_id text,
  add column if not exists old_values jsonb,
  add column if not exists new_values jsonb;

-- Backfill table_name from resource_type for old rows (best-effort)
update audit_log set table_name = resource_type where table_name is null and resource_type is not null;

-- ─── §3: triggers that write audit_log on mutations ─────────────────────────
-- Generic trigger function: writes old_values + new_values JSONB to audit_log.
-- The actor_user_id is NULL for trigger-level audits (we can't always see the
-- JWT from a trigger); app-level mutations should still write their own
-- audit_log row with the actor.

create or replace function audit_trigger_fn() returns trigger as $$
declare
  v_old jsonb;
  v_new jsonb;
begin
  v_old := case when TG_OP = 'DELETE' or TG_OP = 'UPDATE' then to_jsonb(old) else null end;
  v_new := case when TG_OP = 'INSERT' or TG_OP = 'UPDATE' then to_jsonb(new) else null end;
  insert into audit_log (action, table_name, record_id, old_values, new_values, metadata, created_at)
  values (
    TG_OP::text,
    TG_TABLE_NAME,
    coalesce(
      (case when v_new is not null then v_new->>'id' end),
      (case when v_old is not null then v_old->>'id' end)
    ),
    v_old,
    v_new,
    jsonb_build_object('op', TG_OP, 'table', TG_TABLE_NAME),
    now()
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists trg_audit_claims on claims;
create trigger trg_audit_claims
  after insert or update or delete on claims
  for each row execute function audit_trigger_fn();

drop trigger if exists trg_audit_scans on scans;
create trigger trg_audit_scans
  after insert or update or delete on scans
  for each row execute function audit_trigger_fn();

drop trigger if exists trg_audit_verification_badges on verification_badges;
create trigger trg_audit_verification_badges
  after insert or update or delete on verification_badges
  for each row execute function audit_trigger_fn();

drop trigger if exists trg_audit_api_keys on api_keys;
create trigger trg_audit_api_keys
  after insert or update or delete on api_keys
  for each row execute function audit_trigger_fn();

-- ─── §4: claims dedup + confidence columns ──────────────────────────────────
alter table claims
  add column if not exists claim_text_normalized text,
  add column if not exists claim_text_hash text,
  add column if not exists duplicate_count integer not null default 0,
  add column if not exists classification_confidence real;

create index if not exists idx_claims_hash on claims(claim_text_hash);
create index if not exists idx_claims_confidence on claims(classification_confidence) where classification_confidence is not null;

-- ─── §4: enforcement_patterns freshness ─────────────────────────────────────
alter table enforcement_patterns
  add column if not exists last_enforced_date date,
  add column if not exists active boolean not null default true,
  add column if not exists enforcement_count integer not null default 0;

create index if not exists idx_patterns_active on enforcement_patterns(active) where active = true;
create index if not exists idx_patterns_last_enforced on enforcement_patterns(last_enforced_date);

-- ─── §4: claims_archive (cold storage for guardian >2y per §7) ──────────────
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

-- ─── §6: deletion_requests ──────────────────────────────────────────────────
create table if not exists deletion_requests (
  id uuid primary key default uuid_generate_v4(),
  domain text not null,
  site_id uuid references sites(id) on delete set null,
  requester_email text not null,
  requester_name text,
  reason text,
  status text not null default 'open',  -- open | processing | completed | rejected
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dr_domain on deletion_requests(domain);
create index if not exists idx_dr_status on deletion_requests(status);
alter table deletion_requests enable row level security;
-- Anyone may submit a deletion request (public intake form); only admin may read all.
drop policy if exists "dr_insert_anyone" on deletion_requests;
create policy "dr_insert_anyone" on deletion_requests for insert with check (true);
drop policy if exists "dr_select_admin_or_self" on deletion_requests;
create policy "dr_select_admin_or_self" on deletion_requests
  for select using (is_admin_or_reviewer());
drop policy if exists "dr_update_admin" on deletion_requests;
create policy "dr_update_admin" on deletion_requests
  for update using (is_admin_or_reviewer());

-- ─── §7: scans.deleted_at (soft delete for retention enforcement) ───────────
alter table scans
  add column if not exists deleted_at timestamptz;
create index if not exists idx_scans_deleted on scans(deleted_at) where deleted_at is not null;

-- ─── §3: RLS on claims_archive (already done above) ─────────────────────────

-- ─── §3: dedup trigger on claims (compute hash + normalized text) ───────────
-- We do this in the application layer (ingestion) instead of a trigger so we
-- can handle dedup logic (skip-insert + increment duplicate_count) cleanly.

commit;

-- ===== MIGRATION 005 =====
-- Guardian monitoring, alerting, and review automation layer
-- Safe to run after supabase/schema.sql.

alter table sites
  add column if not exists user_id uuid references auth.users(id),
  add column if not exists agency_id uuid references agencies(id),
  add column if not exists is_verified boolean default false,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_code text,
  add column if not exists verification_method text check (verification_method in ('dns_txt','meta_tag','file_upload')),
  add column if not exists monitoring_enabled boolean default false,
  add column if not exists next_rescan_at timestamptz,
  add column if not exists last_distortion_checked_at timestamptz;

alter table scans
  add column if not exists agency_id uuid references agencies(id),
  add column if not exists review_status text default 'preview' check (review_status in ('preview','draft','pending_human_review','approved_for_delivery','flagged_for_legal','needs_client_clarification','delivered')),
  add column if not exists source_context text default 'user_submitted' check (source_context in ('user_submitted','owner_verified','seeded_public_index','agency_client','sdk_preflight','guardian_rescan')),
  add column if not exists receipt_url text,
  add column if not exists receipt_generated_at timestamptz,
  add column if not exists review_notes text;

alter table claims
  add column if not exists human_review_status text default 'unreviewed' check (human_review_status in ('unreviewed','approved','rejected','flagged_for_legal','needs_client_clarification')),
  add column if not exists reviewer_notes text,
  add column if not exists source_context text default 'user_submitted';

alter table enforcement_patterns
  add column if not exists source_type text default 'official' check (source_type in ('official','secondary','analysis')),
  add column if not exists verified_by text,
  add column if not exists verified_at timestamptz;

alter table users
  add column if not exists email_notifications_enabled boolean default true,
  add column if not exists critical_alert_emails_enabled boolean default true,
  add column if not exists monthly_summary_emails_enabled boolean default true,
  add column if not exists last_scanned_at timestamptz;

create table if not exists distortion_logs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  scan_id uuid references scans(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  domain text not null,
  ai_model text not null,
  query_text text not null,
  ai_answer text not null,
  discrepancies_json jsonb default '[]'::jsonb,
  overall_risk text default 'low' check (overall_risk in ('low','medium','high','critical')),
  detected_at timestamptz default now(),
  resolved_at timestamptz,
  notified_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

alter table distortion_logs
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists domain text,
  add column if not exists ai_model text,
  add column if not exists query_text text,
  add column if not exists ai_answer text,
  add column if not exists discrepancies_json jsonb default '[]'::jsonb,
  add column if not exists overall_risk text default 'low',
  add column if not exists detected_at timestamptz default now(),
  add column if not exists resolved_at timestamptz,
  add column if not exists notified_at timestamptz,
  add column if not exists metadata jsonb default '{}'::jsonb;

create index if not exists idx_distortion_logs_domain on distortion_logs(domain, detected_at desc);
create index if not exists idx_distortion_logs_site on distortion_logs(site_id, detected_at desc);
create index if not exists idx_distortion_logs_risk on distortion_logs(overall_risk) where resolved_at is null;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('scan_complete','distortion_alert','monthly_rescan','badge_expiring','receipt_ready')),
  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb,
  read boolean default false,
  emailed boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on notifications(user_id) where read = false;

create table if not exists outreach_logs (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  contact_name text,
  contact_email text not null,
  vertical text,
  scan_id uuid references scans(id) on delete set null,
  claim_health_score integer check (claim_health_score between 0 and 100),
  status text default 'queued' check (status in ('queued','sent','opened','clicked','replied','bounced','skipped','failed')),
  email_subject text,
  email_body text,
  provider_message_id text,
  error text,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_outreach_email on outreach_logs(contact_email, created_at desc);
create index if not exists idx_outreach_status on outreach_logs(status);

create table if not exists domain_verifications (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  method text not null check (method in ('dns_txt','meta_tag','file_upload')),
  code text not null,
  status text default 'pending' check (status in ('pending','verified','failed','expired')),
  checked_at timestamptz,
  verified_at timestamptz,
  expires_at timestamptz default now() + interval '14 days',
  created_at timestamptz default now()
);
create index if not exists idx_domain_verifications_site on domain_verifications(site_id, created_at desc);
create index if not exists idx_domain_verifications_user on domain_verifications(user_id, created_at desc);

create table if not exists api_usage_events (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  agency_id uuid references agencies(id) on delete set null,
  endpoint text not null,
  scan_id uuid references scans(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists idx_api_usage_key on api_usage_events(api_key_id, created_at desc);

alter table distortion_logs enable row level security;
alter table notifications enable row level security;
alter table outreach_logs enable row level security;
alter table domain_verifications enable row level security;
alter table api_usage_events enable row level security;

do $$ begin
  create policy "users can read own notifications" on notifications
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "users can update own notifications" on notifications
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "users can read own domain verifications" on domain_verifications
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "users can read own distortion logs" on distortion_logs
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- outreach_logs and api_usage_events remain service-role only by omission.

-- ===== MIGRATION 006 =====
-- Claim Provenance Engine
-- Adds claim memory: stable hashes, versions, source provenance, resolution status,
-- and an append-only timeline of claim lifecycle events.

alter table claims
  add column if not exists claim_hash text,
  add column if not exists first_seen_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists source_url text,
  add column if not exists domain text,
  add column if not exists source_type text default 'website',
  add column if not exists claim_version integer default 1,
  add column if not exists distortion_source text,
  add column if not exists recommended_rewrite text,
  add column if not exists resolution_status text default 'open',
  add column if not exists supersedes_claim_id uuid references claims(id) on delete set null,
  add column if not exists is_current boolean default true,
  add column if not exists provenance_metadata jsonb default '{}'::jsonb;

-- Expand legacy checks without breaking rows inserted before provenance existed.
alter table claims drop constraint if exists claims_evidence_status_check;
alter table claims add constraint claims_evidence_status_check check (
  evidence_status in ('supported','weak_evidence','unsupported','overstated')
);

alter table claims drop constraint if exists claims_source_type_check;
alter table claims add constraint claims_source_type_check check (
  source_type in ('website','ad','ai_answer','review','directory','social','other')
);

alter table claims drop constraint if exists claims_resolution_status_check;
alter table claims add constraint claims_resolution_status_check check (
  resolution_status in ('open','missing_once','fixed_pending_confirmation','fixed','ignored','escalated')
);

create index if not exists idx_claims_hash on claims (claim_hash);
create index if not exists idx_claims_site_hash_current on claims (site_id, claim_hash, is_current);
create index if not exists idx_claims_site_current on claims (site_id, is_current) where is_current = true;
create index if not exists idx_claims_last_seen on claims (site_id, last_seen_at desc);

-- Performance indexes required by the production provenance timeline API.
create index if not exists idx_claims_claim_hash on claims(claim_hash);
create index if not exists idx_claims_domain_current on claims(domain, is_current);
create index if not exists idx_claims_domain_hash_version on claims(domain, claim_hash, claim_version desc);
create index if not exists idx_claims_resolution_status on claims(resolution_status);
create index if not exists idx_claims_source_type on claims(source_type);


create table if not exists claim_provenance_events (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete set null,
  site_id uuid references sites(id) on delete cascade,
  scan_id uuid references scans(id) on delete set null,
  claim_hash text not null,
  domain text,
  event_type text not null check (event_type in (
    'first_seen',
    'seen',
    'changed',
    'missing',
    'missing_once',
    'fixed_pending_confirmation',
    'fixed',
    'distorted',
    'rewrite_recommended',
    'evidence_changed',
    'resolution_changed'
  )),
  event_summary text,
  from_value text,
  to_value text,
  source_type text check (source_type in ('website','ad','ai_answer','review','directory','social','other')),
  source_url text,
  distortion_log_id uuid references distortion_logs(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table claim_provenance_events
  add column if not exists domain text;

alter table claim_provenance_events drop constraint if exists claim_provenance_events_event_type_check;
alter table claim_provenance_events add constraint claim_provenance_events_event_type_check check (
  event_type in (
    'first_seen',
    'seen',
    'changed',
    'missing',
    'missing_once',
    'fixed_pending_confirmation',
    'fixed',
    'distorted',
    'rewrite_recommended',
    'evidence_changed',
    'resolution_changed'
  )
);

create index if not exists idx_claim_events_hash on claim_provenance_events (claim_hash, created_at desc);
create index if not exists idx_claim_events_site on claim_provenance_events (site_id, created_at desc);
create index if not exists idx_claim_events_claim on claim_provenance_events (claim_id, created_at desc);
create index if not exists idx_claim_provenance_events_claim_hash on claim_provenance_events(claim_hash);
create index if not exists idx_claim_provenance_events_domain_created on claim_provenance_events(domain, created_at desc);

-- Backfill denormalized domain for existing rows so domain-based provenance indexes are useful.
update claims
set domain = sites.domain
from sites
where claims.site_id = sites.id and claims.domain is null;

update claim_provenance_events
set domain = sites.domain
from sites
where claim_provenance_events.site_id = sites.id and claim_provenance_events.domain is null;


alter table claim_provenance_events enable row level security;

-- Public can read provenance events only for public scans. Owners can read their own events.
do $$ begin
  create policy "claim provenance readable for public scans" on claim_provenance_events
    for select using (
      exists (
        select 1
        from scans
        join sites on sites.id = scans.site_id
        where scans.id = claim_provenance_events.scan_id
          and (sites.is_public = true or scans.is_public = true)
          and sites.deletion_requested_at is null
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owners can read own claim provenance" on claim_provenance_events
    for select using (
      exists (select 1 from scans where scans.id = claim_provenance_events.scan_id and scans.user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

-- ===== MIGRATION 007 =====
-- Release blocker fixes for deployment readiness.
-- Idempotently aligns enum values and legacy table shape with runtime writes.

do $$
begin
  if exists (select 1 from pg_type where typname = 'scan_status') and
     not exists (
       select 1
       from pg_enum e
       join pg_type t on t.oid = e.enumtypid
       where t.typname = 'scan_status' and e.enumlabel = 'completed'
     ) then
    alter type scan_status add value 'completed';
  end if;
end $$;

ALTER TYPE source_context ADD VALUE IF NOT EXISTS 'free_snapshot';
ALTER TYPE source_context ADD VALUE IF NOT EXISTS 'guardian_rescan';
ALTER TYPE source_context ADD VALUE IF NOT EXISTS 'ai_distortion_monitor';
ALTER TYPE source_context ADD VALUE IF NOT EXISTS 'owner_verified';
ALTER TYPE source_context ADD VALUE IF NOT EXISTS 'agency_client';
ALTER TYPE source_context ADD VALUE IF NOT EXISTS 'sdk_preflight';

alter table distortion_logs
  add column if not exists domain text,
  add column if not exists query_text text,
  add column if not exists ai_answer text,
  add column if not exists discrepancies_json jsonb default '[]'::jsonb,
  add column if not exists overall_risk text default 'low',
  add column if not exists detected_at timestamptz default now(),
  add column if not exists resolved_at timestamptz,
  add column if not exists notified_at timestamptz,
  add column if not exists metadata jsonb default '{}'::jsonb;

create index if not exists idx_distortion_logs_domain on distortion_logs(domain, detected_at desc);
create index if not exists idx_distortion_logs_site on distortion_logs(site_id, detected_at desc);
create index if not exists idx_distortion_logs_risk on distortion_logs(overall_risk) where resolved_at is null;

create unique index if not exists enforcement_patterns_slug_unique_idx
  on enforcement_patterns(slug);

-- ===== MIGRATION 008 (sites runtime cols) =====
-- ============================================================================
-- 008_sites_runtime_columns.sql
-- Captures columns that existed only on the live (now-deleted) Supabase project.
-- The scan pipeline and dashboard code reference these on `sites`:
--   url, industry, last_scanned_at, claim_health_score
-- They were never in schema.sql or migrations 0001-0007; recreated here so the
-- schema is reconstructable from this repo. Idempotent: safe to re-run.
-- Apply AFTER schema.sql + migrations 0001, 0002, 005, 006, 007.
-- ============================================================================

alter table sites
  add column if not exists url text,
  add column if not exists industry text,
  add column if not exists last_scanned_at timestamptz,
  add column if not exists claim_health_score integer;

create index if not exists idx_sites_last_scanned on sites(last_scanned_at) where last_scanned_at is not null;
create index if not exists idx_sites_industry on sites(industry) where industry is not null;
