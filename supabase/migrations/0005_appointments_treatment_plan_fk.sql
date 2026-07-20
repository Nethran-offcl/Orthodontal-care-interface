-- Phase 4 backfill: run this AFTER seeding treatment_plans data (the Phase 4
-- block in supabase/seed.sql). Adds the FK that couldn't exist until the
-- referenced treatment_plans rows did.

alter table public.appointments
  add constraint appointments_treatment_plan_id_fkey
  foreign key (treatment_plan_id) references public.treatment_plans (id);
