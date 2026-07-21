-- Self-signup accounts (doctor/receptionist) start pending and get no app
-- access until an admin approves them. Admins are never created this way —
-- there is no 'admin' option in the signup role picker, and this migration
-- doesn't add one.

alter table public.profiles
  add column if not exists status text not null default 'active' check (status in ('pending', 'active', 'rejected')),
  add column if not exists requested_role text check (requested_role in ('doctor', 'receptionist')),
  add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  req_role text := new.raw_user_meta_data ->> 'requested_role';
  chosen_role text := case when req_role in ('doctor', 'receptionist') then req_role else 'receptionist' end;
begin
  insert into public.profiles (id, display_name, email, role, requested_role, status)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    new.email,
    chosen_role,
    req_role,
    'pending'
  );
  return new;
end;
$$;

-- Admins need to see every pending signup, and to approve/reject it by
-- flipping status (and optionally role). Both checks look up the caller's
-- own profile row via the existing "user selects own profile" policy, so
-- this terminates without recursion.

create policy "profiles: admins select all"
  on public.profiles for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'))
  ;

create policy "profiles: admins update"
  on public.profiles for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'));
