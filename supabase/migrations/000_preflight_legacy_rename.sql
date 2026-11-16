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
