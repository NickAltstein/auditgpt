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
