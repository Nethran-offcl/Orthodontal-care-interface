-- 0010 added "profiles: admins select all" / "profiles: admins update" policies
-- that query public.profiles from within a policy defined ON public.profiles.
-- Postgres detects this as self-referential and raises 42P17 ("infinite
-- recursion detected in policy for relation profiles") for ANY authenticated
-- query against profiles -- and, transitively, for any other table (e.g.
-- chart_entries, staff_members) whose own admin/doctor policy checks profiles.
--
-- Fix: move the admin check into a security definer function. Such a function
-- runs as its owner (the migration role, which owns the tables and therefore
-- bypasses RLS on them), so the lookup inside it never re-enters profiles' own
-- policies.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  )
$$;

drop policy if exists "profiles: admins select all" on public.profiles;
drop policy if exists "profiles: admins update" on public.profiles;

create policy "profiles: admins select all"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "profiles: admins update"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
