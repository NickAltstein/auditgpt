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
