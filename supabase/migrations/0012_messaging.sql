-- Phase 7 (Part 2): messaging inbox — conversations, chat_messages, internal_notes,
-- attachments. Normalized into FK'd tables (not jsonb) since messages need
-- independent realtime inserts.

create table if not exists public.conversations (
  id text primary key default gen_random_uuid()::text,
  patient_id text not null references public.patients (id),
  last_message_at timestamptz not null default now(),
  unread int not null default 0,
  sla_minutes int not null default 0,
  channel text not null check (channel in ('whatsapp', 'instagram', 'facebook', 'email')),
  status text not null default 'open' check (status in ('open', 'pending', 'waiting', 'resolved')),
  -- Not FK'd: assignee may be a doctor or a staff member (two different tables),
  -- same pattern as escalations.assigned_to_id.
  assignee_id text,
  priority text check (priority in ('low', 'medium', 'high'))
);

create table if not exists public.chat_messages (
  id text primary key default gen_random_uuid()::text,
  conversation_id text not null references public.conversations (id) on delete cascade,
  sender text not null check (sender in ('clinic', 'patient')),
  text text not null,
  time timestamptz not null default now(),
  status text check (status in ('sent', 'delivered', 'read', 'failed')),
  provider_message_id text
);

create table if not exists public.internal_notes (
  id text primary key default gen_random_uuid()::text,
  conversation_id text not null references public.conversations (id) on delete cascade,
  author text not null,
  text text not null,
  time timestamptz not null default now()
);

create table if not exists public.attachments (
  id text primary key default gen_random_uuid()::text,
  conversation_id text not null references public.conversations (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('image', 'document', 'audio')),
  size_kb int not null,
  time timestamptz not null default now()
);

create index if not exists conversations_patient_id_idx on public.conversations (patient_id);
create index if not exists chat_messages_conversation_id_idx on public.chat_messages (conversation_id);
create index if not exists internal_notes_conversation_id_idx on public.internal_notes (conversation_id);
create index if not exists attachments_conversation_id_idx on public.attachments (conversation_id);

-- escalations.conversation_id was left un-FK'd in 0008_ops_tables.sql pending this table's
-- existence. The constraint itself is added in seed.sql, not here: escalations was already
-- seeded with rows pointing at conversation ids (CV-9004, CV-9001) that only exist once this
-- document's seed data runs, so adding the FK here — before any conversations exist — would
-- fail validation against those existing rows.

alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.internal_notes enable row level security;
alter table public.attachments enable row level security;

-- conversations: any staff selects/inserts/updates (status, assignment, unread, lastMessageAt)
create policy "conversations: any staff selects" on public.conversations for select to authenticated using (true);
create policy "conversations: any staff inserts" on public.conversations for insert to authenticated with check (true);
create policy "conversations: any staff updates" on public.conversations for update to authenticated using (true) with check (true);

-- chat_messages: any staff selects/inserts (status updates land here too, e.g. delivery receipts)
create policy "chat_messages: any staff selects" on public.chat_messages for select to authenticated using (true);
create policy "chat_messages: any staff inserts" on public.chat_messages for insert to authenticated with check (true);
create policy "chat_messages: any staff updates" on public.chat_messages for update to authenticated using (true) with check (true);

-- attachments: any staff selects/inserts
create policy "attachments: any staff selects" on public.attachments for select to authenticated using (true);
create policy "attachments: any staff inserts" on public.attachments for insert to authenticated with check (true);

-- internal_notes: any staff selects/inserts; only a note's author or admin updates/deletes
create policy "internal_notes: any staff selects" on public.internal_notes for select to authenticated using (true);
create policy "internal_notes: any staff inserts" on public.internal_notes for insert to authenticated with check (true);
create policy "internal_notes: author or admin updates" on public.internal_notes for update
  to authenticated
  using (
    author = (select display_name from public.profiles where id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    author = (select display_name from public.profiles where id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "internal_notes: author or admin deletes" on public.internal_notes for delete
  to authenticated
  using (
    author = (select display_name from public.profiles where id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
