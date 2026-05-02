-- ============================================================
-- NorthernHires — Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────
create type job_type as enum ('full-time', 'part-time', 'contract', 'casual', 'seasonal', 'apprenticeship');
create type salary_type as enum ('hourly', 'annual', 'negotiable');
create type application_status as enum ('pending', 'reviewed', 'interview', 'offered', 'rejected');

-- ── Employers ───────────────────────────────────────────────
create table public.employers (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  company_name  text not null,
  description   text,
  website       text,
  logo_url      text,
  city          text not null default 'Prince George',
  province      text not null default 'BC',
  phone         text,
  verified      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.employers enable row level security;

create policy "Employers are viewable by everyone"
  on public.employers for select using (true);

create policy "Employer can update own record"
  on public.employers for update using (auth.uid() = user_id);

create policy "Employer can insert own record"
  on public.employers for insert with check (auth.uid() = user_id);

-- ── Job Seekers ──────────────────────────────────────────────
create table public.job_seekers (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  full_name   text not null,
  phone       text,
  city        text,
  resume_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.job_seekers enable row level security;

create policy "Job seekers can read own record"
  on public.job_seekers for select using (auth.uid() = user_id);

create policy "Job seekers can insert own record"
  on public.job_seekers for insert with check (auth.uid() = user_id);

create policy "Job seekers can update own record"
  on public.job_seekers for update using (auth.uid() = user_id);

-- ── Jobs ────────────────────────────────────────────────────
create table public.jobs (
  id            uuid primary key default uuid_generate_v4(),
  employer_id   uuid references public.employers(id) on delete cascade not null,
  title         text not null,
  description   text not null,
  category      text not null,
  job_type      job_type not null default 'full-time',
  salary_min    numeric,
  salary_max    numeric,
  salary_type   salary_type not null default 'negotiable',
  city          text not null default 'Prince George',
  province      text not null default 'BC',
  region        text,           -- e.g. 'Prince George', 'Vanderhoof', 'Burns Lake'
  is_active     boolean not null default true,
  is_featured   boolean not null default false,
  apply_url     text,           -- external apply link, null = apply on-site
  apply_email   text,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Active jobs are viewable by everyone"
  on public.jobs for select using (is_active = true);

create policy "Employer can manage own jobs"
  on public.jobs for all using (
    employer_id in (
      select id from public.employers where user_id = auth.uid()
    )
  );

-- ── Applications ─────────────────────────────────────────────
create table public.applications (
  id              uuid primary key default uuid_generate_v4(),
  job_id          uuid references public.jobs(id) on delete cascade not null,
  job_seeker_id   uuid references public.job_seekers(id) on delete cascade not null,
  cover_letter    text,
  status          application_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(job_id, job_seeker_id)
);

alter table public.applications enable row level security;

create policy "Job seeker can view own applications"
  on public.applications for select using (
    job_seeker_id in (
      select id from public.job_seekers where user_id = auth.uid()
    )
  );

create policy "Job seeker can submit application"
  on public.applications for insert with check (
    job_seeker_id in (
      select id from public.job_seekers where user_id = auth.uid()
    )
  );

create policy "Employer can view applications for their jobs"
  on public.applications for select using (
    job_id in (
      select j.id from public.jobs j
      join public.employers e on e.id = j.employer_id
      where e.user_id = auth.uid()
    )
  );

create policy "Employer can update application status"
  on public.applications for update using (
    job_id in (
      select j.id from public.jobs j
      join public.employers e on e.id = j.employer_id
      where e.user_id = auth.uid()
    )
  );

-- ── Indexes ──────────────────────────────────────────────────
create index jobs_category_idx on public.jobs(category);
create index jobs_job_type_idx on public.jobs(job_type);
create index jobs_city_idx on public.jobs(city);
create index jobs_is_active_idx on public.jobs(is_active);
create index jobs_created_at_idx on public.jobs(created_at desc);
create index jobs_employer_id_idx on public.jobs(employer_id);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger employers_updated_at before update on public.employers
  for each row execute procedure public.handle_updated_at();

create trigger job_seekers_updated_at before update on public.job_seekers
  for each row execute procedure public.handle_updated_at();

create trigger jobs_updated_at before update on public.jobs
  for each row execute procedure public.handle_updated_at();

create trigger applications_updated_at before update on public.applications
  for each row execute procedure public.handle_updated_at();
