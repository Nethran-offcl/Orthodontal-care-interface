-- Same fix as 0014 (patients), applied to every other table where seed.sql
-- uses a readable id convention but the column default is a raw UUID. Each
-- sequence is seeded past the highest existing id in its table's convention
-- so new rows never collide with seed data.

create sequence if not exists public.appointments_id_seq;
select setval('public.appointments_id_seq',
  coalesce((select max(substring(id from 5)::int) from public.appointments where id ~ '^APT-[0-9]+$'), 0));
alter table public.appointments
  alter column id set default ('APT-' || nextval('public.appointments_id_seq')::text);

create sequence if not exists public.treatment_plans_id_seq;
select setval('public.treatment_plans_id_seq',
  coalesce((select max(substring(id from 4)::int) from public.treatment_plans where id ~ '^TP-[0-9]+$'), 0));
alter table public.treatment_plans
  alter column id set default ('TP-' || nextval('public.treatment_plans_id_seq')::text);

create sequence if not exists public.chart_entries_id_seq;
select setval('public.chart_entries_id_seq',
  coalesce((select max(substring(id from 4)::int) from public.chart_entries where id ~ '^CE-[0-9]+$'), 0));
alter table public.chart_entries
  alter column id set default ('CE-' || nextval('public.chart_entries_id_seq')::text);

create sequence if not exists public.prescriptions_id_seq;
select setval('public.prescriptions_id_seq',
  coalesce((select max(substring(id from 4)::int) from public.prescriptions where id ~ '^RX-[0-9]+$'), 0));
alter table public.prescriptions
  alter column id set default ('RX-' || nextval('public.prescriptions_id_seq')::text);

create sequence if not exists public.broadcasts_id_seq;
select setval('public.broadcasts_id_seq',
  coalesce((select max(substring(id from 4)::int) from public.broadcasts where id ~ '^BC-[0-9]+$'), 0));
alter table public.broadcasts
  alter column id set default ('BC-' || nextval('public.broadcasts_id_seq')::text);

create sequence if not exists public.message_templates_id_seq;
select setval('public.message_templates_id_seq',
  coalesce((select max(substring(id from 5)::int) from public.message_templates where id ~ '^TPL-[0-9]+$'), 0));
alter table public.message_templates
  alter column id set default ('TPL-' || nextval('public.message_templates_id_seq')::text);

create sequence if not exists public.escalations_id_seq;
select setval('public.escalations_id_seq',
  coalesce((select max(substring(id from 5)::int) from public.escalations where id ~ '^ESC-[0-9]+$'), 0));
alter table public.escalations
  alter column id set default ('ESC-' || nextval('public.escalations_id_seq')::text);

create sequence if not exists public.conversations_id_seq;
select setval('public.conversations_id_seq',
  coalesce((select max(substring(id from 4)::int) from public.conversations where id ~ '^CV-[0-9]+$'), 0));
alter table public.conversations
  alter column id set default ('CV-' || nextval('public.conversations_id_seq')::text);

-- No seed rows for these two, so no existing convention to match against —
-- picking a prefix consistent with the others.
create sequence if not exists public.patient_images_id_seq;
alter table public.patient_images
  alter column id set default ('IMG-' || nextval('public.patient_images_id_seq')::text);

create sequence if not exists public.voice_notes_id_seq;
alter table public.voice_notes
  alter column id set default ('VN-' || nextval('public.voice_notes_id_seq')::text);
