-- Phase 6: billing — invoices

create table if not exists public.invoices (
  id text primary key default gen_random_uuid()::text,
  patient_id text not null references public.patients (id),
  date date not null default current_date,
  items jsonb not null default '[]',
  total numeric not null default 0,
  paid numeric not null default 0,
  status text not null default 'pending' check (status in ('paid', 'pending', 'partial'))
);

create index if not exists invoices_patient_id_idx on public.invoices (patient_id);

alter table public.invoices enable row level security;

create policy "invoices: any staff selects"
  on public.invoices for select
  to authenticated
  using (true);

create policy "invoices: any staff inserts"
  on public.invoices for insert
  to authenticated
  with check (true);

create policy "invoices: any staff updates"
  on public.invoices for update
  to authenticated
  using (true)
  with check (true);
