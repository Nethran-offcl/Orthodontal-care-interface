-- Phase 3: scheduling — appointments

create table if not exists public.appointments (
  id text primary key default gen_random_uuid()::text,
  patient_id text not null references public.patients (id),
  doctor_id text not null references public.doctors (id),
  date date not null,
  start_time text not null,
  duration_min int not null,
  status text not null default 'pending'
    check (status in ('confirmed', 'pending', 'checked-in', 'completed', 'cancelled', 'no-show')),
  reason text not null,
  notes text,
  is_follow_up boolean not null default false,
  -- Plain column for now; FK'd to treatment_plans once that table exists in Phase 4.
  treatment_plan_id text
);

create index if not exists appointments_date_idx on public.appointments (date);
create index if not exists appointments_patient_id_idx on public.appointments (patient_id);
create index if not exists appointments_doctor_id_idx on public.appointments (doctor_id);

alter table public.appointments enable row level security;

create policy "appointments: any staff selects"
  on public.appointments for select
  to authenticated
  using (true);

create policy "appointments: any staff inserts"
  on public.appointments for insert
  to authenticated
  with check (true);

create policy "appointments: any staff updates"
  on public.appointments for update
  to authenticated
  using (true)
  with check (true);
