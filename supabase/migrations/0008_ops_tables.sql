-- Phase 8: ops tables — reminders, broadcasts, message templates, escalations,
-- notifications, audit log.

create table if not exists public.reminders (
  id text primary key default gen_random_uuid()::text,
  patient_id text not null references public.patients (id),
  appointment_id text not null references public.appointments (id),
  treatment_plan_id text references public.treatment_plans (id),
  due_date date not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'sent', 'confirmed', 'no-response', 'rescheduled')),
  sent_at timestamptz
);

create table if not exists public.broadcasts (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  message text not null,
  audience text not null,
  audience_count int not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'pending-approval', 'approved', 'scheduled', 'sent', 'rejected')),
  created_by text not null,
  created_at timestamptz not null default now(),
  scheduled_for timestamptz,
  sent_at timestamptz,
  delivered_count int,
  read_count int,
  review_note text
);

create table if not exists public.message_templates (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text not null check (category in ('Reminder', 'Confirmation', 'Reschedule', 'Broadcast')),
  body text not null,
  approval_status text not null default 'pending' check (approval_status in ('approved', 'pending')),
  language text not null default 'English',
  used_count int not null default 0
);

create table if not exists public.escalations (
  id text primary key default gen_random_uuid()::text,
  -- Plain reference, not FK'd: the conversations table doesn't exist yet
  -- (messaging/Phase 7 is deferred). Same pattern as appointments.treatment_plan_id
  -- before its Phase 4 backfill — link it for real whenever Phase 7 happens.
  conversation_id text,
  patient_id text not null references public.patients (id),
  reason text not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_role text not null check (assigned_role in ('doctor', 'receptionist', 'admin')),
  -- Not FK'd: assignee may be a doctor or a staff member (two different tables).
  assigned_to_id text,
  status text not null default 'open' check (status in ('open', 'in-progress', 'resolved')),
  created_at timestamptz not null default now(),
  created_by text not null,
  comments jsonb not null default '[]',
  history jsonb not null default '[]'
);

create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text not null,
  time timestamptz not null default now(),
  read boolean not null default false,
  type text not null check (type in ('reminder', 'payment', 'message', 'system', 'broadcast', 'escalation', 'assignment')),
  href text
);

create table if not exists public.audit_log (
  id text primary key default gen_random_uuid()::text,
  actor text not null,
  action text not null,
  target text not null,
  time timestamptz not null default now()
);

create index if not exists reminders_patient_id_idx on public.reminders (patient_id);
create index if not exists escalations_patient_id_idx on public.escalations (patient_id);

alter table public.reminders enable row level security;
alter table public.broadcasts enable row level security;
alter table public.message_templates enable row level security;
alter table public.escalations enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- reminders: any staff selects/inserts/updates (status changes, e.g. confirmed/no-response)
create policy "reminders: any staff selects" on public.reminders for select to authenticated using (true);
create policy "reminders: any staff inserts" on public.reminders for insert to authenticated with check (true);
create policy "reminders: any staff updates" on public.reminders for update to authenticated using (true) with check (true);

-- broadcasts: any staff selects/inserts/updates, but only a doctor or admin may
-- set status to approved/rejected — other transitions (submit, send) stay open to any staff.
create policy "broadcasts: any staff selects" on public.broadcasts for select to authenticated using (true);
create policy "broadcasts: any staff inserts" on public.broadcasts for insert to authenticated with check (true);
create policy "broadcasts: staff update, doctor/admin approve" on public.broadcasts for update
  to authenticated
  using (true)
  with check (
    status not in ('approved', 'rejected')
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('doctor', 'admin'))
  );

-- message_templates: any staff selects/inserts (no update path in the app today)
create policy "message_templates: any staff selects" on public.message_templates for select to authenticated using (true);
create policy "message_templates: any staff inserts" on public.message_templates for insert to authenticated with check (true);

-- escalations: any staff selects/inserts/updates (status, assignment, comments)
create policy "escalations: any staff selects" on public.escalations for select to authenticated using (true);
create policy "escalations: any staff inserts" on public.escalations for insert to authenticated with check (true);
create policy "escalations: any staff updates" on public.escalations for update to authenticated using (true) with check (true);

-- notifications: any staff selects/inserts/updates (mark read)
create policy "notifications: any staff selects" on public.notifications for select to authenticated using (true);
create policy "notifications: any staff inserts" on public.notifications for insert to authenticated with check (true);
create policy "notifications: any staff updates" on public.notifications for update to authenticated using (true) with check (true);

-- audit_log: any staff selects/inserts (append-only, never updated)
create policy "audit_log: any staff selects" on public.audit_log for select to authenticated using (true);
create policy "audit_log: any staff inserts" on public.audit_log for insert to authenticated with check (true);
