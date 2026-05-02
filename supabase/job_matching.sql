-- ============================================================
-- NorthernHires — Job Matching
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add job preference columns to job_seekers
alter table public.job_seekers
  add column if not exists preferred_categories text[] not null default '{}',
  add column if not exists preferred_job_types   text[] not null default '{}',
  add column if not exists preferred_regions     text[] not null default '{}';

-- Count seekers whose preferences match a given job posting (used by employers)
-- Empty array means "open to anything", so it still counts as a match
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
    and (array_length(preferred_job_types, 1) is null or p_job_type = any(preferred_job_types))
    and (array_length(preferred_regions, 1) is null or p_region = any(preferred_regions));
$$;

grant execute on function public.count_matched_seekers(text, text, text) to authenticated;
