-- Standalone voice notes: a doctor's personal scratch notes recorded via the Voice Notes
-- page when no patient is attached. chart_entries.patient_id is required not-null (every
-- other consumer — patient timelines, AI-charting review — assumes a chart entry always
-- belongs to a patient), so the unassigned case gets its own table instead of loosening
-- that constraint. When a patient IS picked in the Voice Notes UI, the entry is saved as a
-- real chart_entries row instead; this table only ever holds the unassigned ones.

create table if not exists public.voice_notes (
  id text primary key default gen_random_uuid()::text,
  doctor_id text not null references public.doctors (id),
  transcript text not null,
  tooth_area text,
  diagnosis text,
  procedure text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists voice_notes_doctor_id_idx on public.voice_notes (doctor_id);

alter table public.voice_notes enable row level security;

-- Personal scratch notes: only the owning doctor or an admin can see/write them
-- (receptionists have no reason to browse a doctor's unassigned voice memos).
create policy "voice_notes: owning doctor or admin selects"
  on public.voice_notes for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = voice_notes.doctor_id
    )
  );

create policy "voice_notes: owning doctor or admin inserts"
  on public.voice_notes for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor' and doctor_id = voice_notes.doctor_id
    )
  );
