-- Phase 1: auth & roles
-- One profile row per auth.users row, created automatically on signup.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'receptionist' check (role in ('doctor', 'receptionist', 'admin')),
  doctor_id text,
  staff_id text,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user selects own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- No insert/update policy for authenticated users: rows are created by the
-- trigger below (runs as the table owner) and edited via the service role
-- (e.g. from the Supabase dashboard or an admin-only Edge Function later).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
