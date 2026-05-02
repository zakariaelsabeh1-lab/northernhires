-- Run in Supabase SQL Editor after schema.sql

-- ── Saved Jobs ───────────────────────────────────────────────
create table public.saved_jobs (
  id            uuid primary key default uuid_generate_v4(),
  job_seeker_id uuid references public.job_seekers(id) on delete cascade not null,
  job_id        uuid references public.jobs(id) on delete cascade not null,
  created_at    timestamptz not null default now(),
  unique(job_seeker_id, job_id)
);

alter table public.saved_jobs enable row level security;

create policy "Seekers can view own saved jobs"
  on public.saved_jobs for select
  using (job_seeker_id in (select id from public.job_seekers where user_id = auth.uid()));

create policy "Seekers can save jobs"
  on public.saved_jobs for insert
  with check (job_seeker_id in (select id from public.job_seekers where user_id = auth.uid()));

create policy "Seekers can unsave jobs"
  on public.saved_jobs for delete
  using (job_seeker_id in (select id from public.job_seekers where user_id = auth.uid()));

create index saved_jobs_seeker_idx on public.saved_jobs(job_seeker_id);
create index saved_jobs_job_idx    on public.saved_jobs(job_id);

-- ── Job Alerts ───────────────────────────────────────────────
create table public.job_alerts (
  id            uuid primary key default uuid_generate_v4(),
  email         text not null,
  categories    text[] not null default '{}',
  regions       text[] not null default '{}',
  job_seeker_id uuid references public.job_seekers(id) on delete set null,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(email)
);

alter table public.job_alerts enable row level security;

-- Anyone (including anon) can subscribe
create policy "Anyone can create job alerts"
  on public.job_alerts for insert with check (true);

-- Owner can read/update their own alert row
create policy "Owner can read own alert"
  on public.job_alerts for select
  using (
    email = (select email from auth.users where id = auth.uid())
    or job_seeker_id in (select id from public.job_seekers where user_id = auth.uid())
  );

create policy "Owner can update own alert"
  on public.job_alerts for update
  using (
    email = (select email from auth.users where id = auth.uid())
    or job_seeker_id in (select id from public.job_seekers where user_id = auth.uid())
  );

create trigger job_alerts_updated_at before update on public.job_alerts
  for each row execute procedure public.handle_updated_at();
