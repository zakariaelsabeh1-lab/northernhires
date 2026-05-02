-- Fix: job seeker (and employer) signup fails when Supabase email confirmation
-- is enabled because signUp returns no session, so auth.uid() is null during
-- the subsequent profile insert. Replace direct inserts with security definer
-- functions callable by the anon role.

-- ── Job seeker profile creation ───────────────────────────────
create or replace function public.create_job_seeker_profile(
  p_user_id uuid,
  p_full_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Invalid user_id';
  end if;
  insert into public.job_seekers (user_id, full_name)
  values (p_user_id, p_full_name)
  on conflict (user_id) do nothing;
end;
$$;

grant execute on function public.create_job_seeker_profile(uuid, text) to anon, authenticated;

-- ── Employer profile creation ─────────────────────────────────
create or replace function public.create_employer_profile(
  p_user_id   uuid,
  p_company   text,
  p_city      text,
  p_province  text,
  p_phone     text,
  p_website   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Invalid user_id';
  end if;
  insert into public.employers (user_id, company_name, city, province, phone, website)
  values (p_user_id, p_company, p_city, p_province, p_phone, p_website)
  on conflict (user_id) do nothing;
end;
$$;

grant execute on function public.create_employer_profile(uuid, text, text, text, text, text) to anon, authenticated;

-- Ensure employers table has a unique constraint on user_id (needed for on conflict)
alter table public.employers drop constraint if exists employers_user_id_key;
alter table public.employers add constraint employers_user_id_key unique (user_id);

-- Ensure job_seekers table has a unique constraint on user_id
alter table public.job_seekers drop constraint if exists job_seekers_user_id_key;
alter table public.job_seekers add constraint job_seekers_user_id_key unique (user_id);
