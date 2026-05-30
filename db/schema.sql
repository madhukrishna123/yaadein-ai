create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  whatsapp_phone text not null unique,
  name text,
  free_preview_count integer not null default 0,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists restoration_jobs (
  id text primary key,
  customer_id uuid references customers(id) on delete set null,
  status text not null,
  restoration_style text not null default 'natural',
  source_image_url text not null,
  source_image_path text,
  restored_preview_url text,
  restored_preview_path text,
  watermarked_preview_url text,
  watermarked_preview_path text,
  restored_hd_url text,
  restored_hd_path text,
  before_after_share_url text,
  before_after_share_path text,
  share_page_slug text not null unique,
  price_inr integer not null default 149,
  preview_cost_usd numeric(10, 4),
  hd_cost_usd numeric(10, 4),
  processing_mode text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table restoration_jobs add column if not exists restoration_style text not null default 'natural';
alter table restoration_jobs add column if not exists before_after_share_url text;
alter table restoration_jobs add column if not exists before_after_share_path text;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  job_id text not null references restoration_jobs(id) on delete cascade,
  amount_inr integer not null,
  status text not null,
  razorpay_payment_link_id text,
  razorpay_payment_link_url text,
  razorpay_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table payments add column if not exists razorpay_payment_link_url text;

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  job_id text references restoration_jobs(id) on delete set null,
  direction text not null,
  channel text not null default 'whatsapp',
  message_type text not null,
  body text,
  media_url text,
  provider_message_id text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  job_id text references restoration_jobs(id) on delete set null,
  type text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists restoration_jobs_customer_id_idx on restoration_jobs(customer_id);
create index if not exists restoration_jobs_status_idx on restoration_jobs(status);
create index if not exists restoration_jobs_created_at_idx on restoration_jobs(created_at desc);
create index if not exists payments_job_id_idx on payments(job_id);
create unique index if not exists payments_job_id_unique_idx on payments(job_id);
create index if not exists messages_customer_id_idx on messages(customer_id);
create index if not exists events_type_idx on events(type);
