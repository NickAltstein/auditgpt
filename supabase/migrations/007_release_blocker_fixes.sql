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
