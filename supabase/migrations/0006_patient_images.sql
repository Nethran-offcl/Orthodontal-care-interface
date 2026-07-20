-- Phase 5: patient image storage
--
-- MANUAL (do this in the dashboard first): Storage → Create bucket → name it
-- patient-images → Private. This migration only creates the metadata table and
-- the storage RLS policies; it cannot create the bucket itself.

create table if not exists public.patient_images (
  id text primary key default gen_random_uuid()::text,
  patient_id text not null references public.patients (id),
  tooth_area text not null,
  note text not null default '',
  date date not null default current_date,
  marketing_consent boolean not null default false,
  category text not null check (category in ('before-after', 'clinical', 'report', 'scan', 'xray')),
  annotations jsonb not null default '[]',
  storage_path text not null,
  -- Null when uploaded by a receptionist rather than a doctor — see the delete
  -- policy below, which restricts deletion to the uploading doctor or an admin.
  uploaded_by_doctor_id text references public.doctors (id)
);

create index if not exists patient_images_patient_id_idx on public.patient_images (patient_id);

alter table public.patient_images enable row level security;

create policy "patient_images: any staff selects"
  on public.patient_images for select
  to authenticated
  using (true);

create policy "patient_images: any staff inserts"
  on public.patient_images for insert
  to authenticated
  with check (true);

create policy "patient_images: any staff updates"
  on public.patient_images for update
  to authenticated
  using (true)
  with check (true);

create policy "patient_images: admin or uploading doctor deletes"
  on public.patient_images for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = patient_images.uploaded_by_doctor_id
    )
  );

-- Storage policies: any authenticated (signed-in) staff member can read/write
-- files in the patient-images bucket. Fine-grained ownership rules live on the
-- table above, not at the storage layer.

create policy "patient-images bucket: authenticated select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'patient-images');

create policy "patient-images bucket: authenticated insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'patient-images');

create policy "patient-images bucket: authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'patient-images');
