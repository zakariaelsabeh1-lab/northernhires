-- Run in Supabase SQL Editor
-- Replaces direct RLS-gated inserts/deletes with a single security definer
-- function so the toggle always works for authenticated job seekers.

create or replace function public.toggle_saved_job(p_job_id uuid)
returns boolean   -- true = now saved, false = now unsaved
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seeker_id uuid;
  v_was_saved  boolean;
begin
  select id into v_seeker_id
  from public.job_seekers
  where user_id = auth.uid();

  if v_seeker_id is null then
    raise exception 'No job seeker profile found for this user';
  end if;

  select exists(
    select 1 from public.saved_jobs
    where job_seeker_id = v_seeker_id and job_id = p_job_id
  ) into v_was_saved;

  if v_was_saved then
    delete from public.saved_jobs
    where job_seeker_id = v_seeker_id and job_id = p_job_id;
    return false;
  else
    insert into public.saved_jobs (job_seeker_id, job_id)
    values (v_seeker_id, p_job_id)
    on conflict (job_seeker_id, job_id) do nothing;
    return true;
  end if;
end;
$$;

grant execute on function public.toggle_saved_job(uuid) to authenticated;
