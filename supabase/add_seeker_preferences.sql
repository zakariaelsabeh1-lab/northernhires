-- ============================================================
-- NorthernHires — Job Seeker Preferences & Skills
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.job_seekers
  add column if not exists preferred_categories text[]  not null default '{}',
  add column if not exists preferred_job_type   text,
  add column if not exists preferred_region     text,
  add column if not exists skills               text[]  not null default '{}';

-- Updated RPC: count seekers whose preferences match a job posting
-- preferred_job_type / preferred_region NULL means "open to anything"
-- preferred_categories empty array means "open to any category"
create or replace function public.count_matched_seekers(
  p_category text,
  p_job_type text,
  p_region   text
) returns integer
language sql
security definer
as $$
  select count(*)::integer
  from public.job_seekers
  where
    (array_length(preferred_categories, 1) is null or p_category = any(preferred_categories))
    and (preferred_job_type is null or preferred_job_type = p_job_type)
    and (preferred_region   is null or preferred_region   = p_region);
$$;

grant execute on function public.count_matched_seekers(text, text, text) to authenticated;
