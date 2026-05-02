-- Run this in the Supabase SQL Editor after schema.sql

alter table public.jobs add column if not exists views integer not null default 0;

-- Atomically increments view count; runs as definer so anon users can call it
create or replace function public.increment_job_views(job_id uuid)
returns void
language sql
security definer
as $$
  update public.jobs
  set views = views + 1
  where id = job_id and is_active = true;
$$;

-- Allow anyone (including anon) to call the view-increment RPC
grant execute on function public.increment_job_views(uuid) to anon, authenticated;
