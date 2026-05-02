-- ============================================================
-- NorthernHires — Job Alerts
-- Run in Supabase SQL Editor
-- Safe to run on a fresh DB or one that already has job_alerts
-- from add_saved_jobs_and_alerts.sql
-- ============================================================

create table if not exists public.job_alerts (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id) on delete cascade,
  job_seeker_id uuid        references public.job_seekers(id) on delete set null,
  categories    text[]      not null default '{}',
  job_type      text,
  region        text,
  email         text,
  created_at    timestamptz not null default now()
);

-- Add new columns if table already existed from prior migration
alter table public.job_alerts
  add column if not exists user_id  uuid references auth.users(id) on delete cascade,
  add column if not exists job_type text,
  add column if not exists region   text;

alter table public.job_alerts enable row level security;

-- Replace legacy policies with clean ones
drop policy if exists "Anyone can create job alerts" on public.job_alerts;
drop policy if exists "Owner can read own alert"     on public.job_alerts;
drop policy if exists "Owner can update own alert"   on public.job_alerts;

-- Authenticated users: full access to their own rows
create policy "Authenticated users can manage own alerts"
  on public.job_alerts for all
  to authenticated
  using (
    user_id = auth.uid()
    or email = (select email from auth.users where id = auth.uid())
    or job_seeker_id in (select id from public.job_seekers where user_id = auth.uid())
  )
  with check (
    user_id = auth.uid()
    or email = (select email from auth.users where id = auth.uid())
    or job_seeker_id in (select id from public.job_seekers where user_id = auth.uid())
  );

-- Allow unauthenticated visitors to subscribe by email
create policy "Anyone can subscribe to job alerts"
  on public.job_alerts for insert
  with check (true);
