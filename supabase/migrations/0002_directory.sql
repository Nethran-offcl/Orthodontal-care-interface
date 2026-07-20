-- Phase 2: clinic directory — doctors, staff, patients

create table if not exists public.doctors (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  title text not null,
  registration_no text not null,
  specialty text not null,
  phone text not null,
  email text not null,
  color text not null
);

create table if not exists public.staff_members (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  title text not null,
  phone text not null,
  email text not null,
  role text not null check (role in ('receptionist', 'admin')),
  status text not null default 'active' check (status in ('active', 'invited'))
);

create table if not exists public.patients (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  phone text not null,
  age int not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  address text not null,
  lead_source text not null check (lead_source in ('Walk-in', 'Referral', 'Instagram', 'Facebook', 'Google')),
  registered_on date not null default current_date,
  allergies text[] not null default '{}',
  marketing_consent boolean not null default false,
  profile_completeness int not null default 0,
  balance_due numeric not null default 0,
  total_billed numeric not null default 0,
  primary_doctor_id text references public.doctors (id),
  medical_conditions text[],
  current_medications text[],
  dental_history_notes text
);

create index if not exists patients_primary_doctor_id_idx on public.patients (primary_doctor_id);

alter table public.doctors enable row level security;
alter table public.staff_members enable row level security;
alter table public.patients enable row level security;

create policy "doctors: any authenticated user selects"
  on public.doctors for select
  to authenticated
  using (true);

create policy "doctors: admins write"
  on public.doctors for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "staff_members: any authenticated user selects"
  on public.staff_members for select
  to authenticated
  using (true);

create policy "staff_members: admins write"
  on public.staff_members for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "patients: any staff selects"
  on public.patients for select
  to authenticated
  using (true);

create policy "patients: any staff writes"
  on public.patients for all
  to authenticated
  using (true)
  with check (true);
