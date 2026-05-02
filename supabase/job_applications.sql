-- ============================================================
-- NorthernHires — job_applications table + storage
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.job_applications (
  id                  uuid primary key default uuid_generate_v4(),
  job_id              uuid references public.jobs(id) on delete cascade not null,
  job_seeker_id       uuid references public.job_seekers(id) on delete cascade not null,
  employer_id         uuid references public.employers(id) on delete cascade not null,
  full_name           text not null,
  email               text not null,
  phone               text,
  years_of_experience integer,
  cover_letter        text,
  resume_url          text,
  status              text not null default 'pending'
    check (status in ('pending', 'reviewed', 'shortlisted', 'rejected')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(job_id, job_seeker_id)
);

alter table public.job_applications enable row level security;

create policy "Job seeker can view own job_applications"
  on public.job_applications for select using (
    job_seeker_id in (
      select id from public.job_seekers where user_id = auth.uid()
    )
  );

create policy "Job seeker can insert job_application"
  on public.job_applications for insert with check (
    job_seeker_id in (
      select id from public.job_seekers where user_id = auth.uid()
    )
  );

create policy "Employer can view job_applications"
  on public.job_applications for select using (
    employer_id in (
      select id from public.employers where user_id = auth.uid()
    )
  );

create policy "Employer can update job_application status"
  on public.job_applications for update using (
    employer_id in (
      select id from public.employers where user_id = auth.uid()
    )
  );

create trigger job_applications_updated_at before update on public.job_applications
  for each row execute procedure public.handle_updated_at();

-- Storage bucket for application resumes
insert into storage.buckets (id, name, public)
values ('application-resumes', 'application-resumes', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload application resumes"
  on storage.objects for insert
  with check (bucket_id = 'application-resumes' and auth.role() = 'authenticated');

create policy "Anyone can view application resumes"
  on storage.objects for select
  using (bucket_id = 'application-resumes');

create policy "Users can update own application resumes"
  on storage.objects for update
  using (bucket_id = 'application-resumes' and auth.uid()::text = (storage.foldername(name))[1]);
