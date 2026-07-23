-- New patients created through the app got a raw UUID as their ID (the
-- table's default), while seeded patients use readable 'PT-1007' style IDs
-- (hardcoded in seed.sql). Give new patients the same readable format by
-- backing the default with a sequence, seeded past the highest existing
-- 'PT-####' id so it never collides with seed data.

create sequence if not exists public.patients_id_seq;

select setval(
  'public.patients_id_seq',
  coalesce((select max(substring(id from 4)::int) from public.patients where id ~ '^PT-[0-9]+$'), 1000)
);

alter table public.patients
  alter column id set default ('PT-' || nextval('public.patients_id_seq')::text);
