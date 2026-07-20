-- Phase 4: clinical records — treatment plans, chart entries, prescriptions
--
-- Note: this migration does NOT add the FK from appointments.treatment_plan_id
-- to treatment_plans yet — appointments already has rows referencing plan IDs
-- (from the Phase 3 seed) that don't exist here until the Phase 4 seed runs.
-- Run 0005_appointments_treatment_plan_fk.sql AFTER seeding this phase's data.

create table if not exists public.treatment_plans (
  id text primary key default gen_random_uuid()::text,
  patient_id text not null references public.patients (id),
  title text not null,
  created_on date not null default current_date,
  created_by_doctor_id text not null references public.doctors (id),
  stages jsonb not null default '[]',
  status text not null default 'active' check (status in ('active', 'completed'))
);

create table if not exists public.chart_entries (
  id text primary key default gen_random_uuid()::text,
  patient_id text not null references public.patients (id),
  date date not null default current_date,
  doctor_id text not null references public.doctors (id),
  tooth_area text not null,
  diagnosis text not null,
  procedure text not null,
  notes text not null default '',
  source text not null default 'manual' check (source in ('voice', 'manual')),
  transcript text
);

create table if not exists public.prescriptions (
  id text primary key default gen_random_uuid()::text,
  patient_id text not null references public.patients (id),
  chart_entry_id text references public.chart_entries (id),
  date date not null default current_date,
  doctor_id text not null references public.doctors (id),
  medicines jsonb not null default '[]',
  notes text not null default ''
);

create index if not exists treatment_plans_patient_id_idx on public.treatment_plans (patient_id);
create index if not exists chart_entries_patient_id_idx on public.chart_entries (patient_id);
create index if not exists prescriptions_patient_id_idx on public.prescriptions (patient_id);

alter table public.treatment_plans enable row level security;
alter table public.chart_entries enable row level security;
alter table public.prescriptions enable row level security;

-- Any staff can read clinical data; only the owning doctor or an admin can write it
-- (receptionists stay read-only across all three clinical tables).

create policy "treatment_plans: any staff selects"
  on public.treatment_plans for select
  to authenticated
  using (true);

create policy "treatment_plans: owning doctor or admin writes"
  on public.treatment_plans for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = treatment_plans.created_by_doctor_id
    )
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = treatment_plans.created_by_doctor_id
    )
  );

create policy "chart_entries: any staff selects"
  on public.chart_entries for select
  to authenticated
  using (true);

create policy "chart_entries: owning doctor or admin writes"
  on public.chart_entries for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = chart_entries.doctor_id
    )
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = chart_entries.doctor_id
    )
  );

create policy "prescriptions: any staff selects"
  on public.prescriptions for select
  to authenticated
  using (true);

create policy "prescriptions: owning doctor or admin writes"
  on public.prescriptions for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = prescriptions.doctor_id
    )
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = prescriptions.doctor_id
    )
  );
