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
