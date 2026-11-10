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
