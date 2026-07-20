# Backend Blueprint — Sunrise Dental Clinic OS

Phased Supabase integration, one prompt at a time. This document is both a reference and an executable script: read a phase, paste its `PROMPT` into a Claude Code session, do its `MANUAL` steps yourself where marked, and check its `VERIFY` line before moving on.

## How this works

- **One phase, one job.** Every page already reads and writes through `src/services/*.service.ts`, never touching mock data directly (mocks live in `src/mocks/*.ts`, types in `src/types/index.ts`). Each phase swaps one or two service files for real Supabase calls, keeping exported method names and signatures identical — so **no page component changes**.
- **Work top to bottom.** Later phases assume earlier tables exist (e.g. Phase 3 appointments FK to Phase 2 patients/doctors).
- **New session per phase, by default.** Each prompt below is self-contained — it names exact files and fields, so Claude doesn't need prior chat history. Continuity lives in the codebase and the database, not the conversation. This keeps every session short and cheap.
- **Stay in the same session only to fix errors.** If a migration fails or a build breaks mid-phase, keep going in that session until `VERIFY` passes — then start fresh for the next phase.
- **CLI vs Interface.** Phases marked `CLI` are pure schema/service code with no visual check needed — faster and cheaper in a terminal. Phases marked `Interface` benefit from live browser testing (login, uploads, realtime) — use the app's browser preview.
- **Keep chat lean.** Do `MANUAL` dashboard/SQL-editor steps directly in the Supabase dashboard — don't paste large SQL or table dumps back into chat unless asking Claude to debug a specific error.
- **When you (the user) must act.** Every phase's `MANUAL` block is something Claude cannot do for you (Supabase dashboard clicks, secrets, credentials). If a phase has no `MANUAL` block, nothing outside the repo is needed for it.

## Fixed decisions (apply to every phase)

- **IDs:** `id text primary key default gen_random_uuid()::text` on every table — seed data reuses today's mock string IDs verbatim; new rows get generated UUIDs automatically.
- **Nested data:** fields always read/written as a unit with their parent (stages, medicines, comments/history, annotations) are `jsonb` columns; anything needing independent inserts or realtime (chat messages, internal notes) gets its own FK'd table.
- **Migrations:** live in `supabase/migrations/`, applied via the SQL editor or `supabase db push` — either is fine.

> **Compliance note:** this schema stores patient names, phone numbers, medical history, and allergies. If this clinic operates somewhere with health-data regulation (HIPAA, DPDP, GDPR), confirm that requirement before real patient data goes in — this blueprint covers standard access control (RLS, private storage), not compliance certification.

## Current repo state this blueprint targets

Verified against the working tree at the time this document was written:

- Services: `src/services/{patients,doctors,users,appointments,calendar,treatment-plans,chart-entries,prescriptions,images,invoices,chat,escalations,reminders,broadcasts,templates,audit-log,notifications,auth,ai,voice,settings}.service.ts`, all re-exported from `src/services/index.ts`.
- Mock data: `src/mocks/*.ts` (doctors, staff, patients, appointments, treatmentPlans, chartEntries, prescriptions, images, invoices, conversations, reminders, broadcasts, templates, escalations, notifications, auditLog, permissions, clinicProfile, whatsappConfig, aiSettings).
- Types: `src/types/index.ts` (Doctor, StaffMember, Patient, Appointment, TreatmentPlan, ChartEntry, Prescription, PatientImage, Invoice, ChatMessage, InternalNote, Attachment, Conversation, Reminder, Broadcast, MessageTemplate, Escalation, AuditLogEntry, …); `ClinicProfile`/`WhatsAppConfig` live in `src/mocks/clinicProfile.ts` / `src/mocks/whatsappConfig.ts`; `ModulePermission` in `src/mocks/permissions.ts`.
- `src/services/types.ts` exports a shared `CrudService<T>` interface and a `createCrudService()` helper that every domain service currently uses to fake a backend against an in-memory array seeded from `mocks/`. This helper is the thing each phase below replaces, module by module.
- `src/services/auth.service.ts` currently implements `login(role, userId)` — a demo login with no password check, persisted to `sessionStorage`. `getPermissionsMatrix` / `updatePermission` / `getRoleKeys` also live here today.
- `PatientImage` has a mock-only `hue: number` field used to render a placeholder thumbnail color — this is dropped once real images exist.

If any of the above has drifted from the repo by the time a phase runs, tell Claude to re-check the relevant file before writing the migration — don't assume this snapshot is still accurate.

---

## Phase 0 — Project & client setup

**Session:** New · Claude Code CLI

**MANUAL — before:**
- Create a free project at supabase.com; copy Project URL + anon public key (Settings → API).
- Create `.env.local` in the project root with those two values.
- Optional: install the Supabase CLI, run `supabase login` then `supabase link` for reproducible migrations from the terminal.

**PROMPT — paste as-is:**
```
Install @supabase/supabase-js. Create src/lib/supabase.ts exporting a `supabase`
client built from import.meta.env.VITE_SUPABASE_URL and
import.meta.env.VITE_SUPABASE_ANON_KEY, throwing a clear error at startup if either
is missing. Add .env.example with placeholder values and confirm .env* is
gitignored. Create supabase/migrations/ with a short README on applying
migrations via the SQL editor or `supabase db push`. Do not touch src/services/.
```

**VERIFY:** `npm run dev` starts clean, no missing-env-var error, app still runs on mocks.

---

## Phase 1 — Auth & roles

**Session:** New · Claude Code interface (test logins live via the browser preview)

Replaces the "any password works" demo login with real Supabase Auth + roles.

**MANUAL — before:**
- Authentication → Providers — confirm Email is enabled (default).
- Authentication → Settings — turn off "Confirm email" for now (re-enable in Phase 11).

**PROMPT — paste as-is:**
```
Add real auth via Supabase, replacing src/services/auth.service.ts.
1. Migration: profiles table — id uuid PK references auth.users, role text
   check(doctor/receptionist/admin) default receptionist, doctor_id text,
   staff_id text, display_name text, created_at timestamptz default now().
   Trigger on auth.users insert creates a blank profiles row. RLS: user selects
   own profile only; insert/update via service role for now.
2. Rewrite auth.service.ts using signInWithPassword / signOut / getSession,
   joined with profiles for role + ids. login(email, password) replaces
   login(role, userId).
3. Update src/state/auth-state.tsx to use supabase.auth.onAuthStateChange.
4. Update src/pages/auth/login-page.tsx: drop the role-tile picker and quick-demo
   buttons, keep the email/password form, surface errors via toast.error.
5. Leave getPermissionsMatrix / updatePermission / getRoleKeys on mocks for now.
```

**MANUAL — after:**
- Authentication → Users → Add User — create one login per role to test.
- SQL editor — set each new user's `profiles.role` (and `doctor_id`/`staff_id` once Phase 2 exists).

**VERIFY:** Each test account signs in with its real password, lands with the correct role, session survives a refresh.

---

## Phase 2 — Directory — doctors, staff, patients

**Session:** New · Claude Code CLI

**PROMPT — paste as-is:**
```
Move the clinic directory to Supabase, matching src/types/index.ts.
1. Migration: doctors, staff_members, patients tables matching the Doctor,
   StaffMember, Patient interfaces (text[] for allergies/medicalConditions/
   currentMedications). RLS: any authenticated user selects; only role='admin'
   writes doctors/staff_members; any staff can write patients.
2. supabase/seed.sql inserting src/mocks/doctors.ts, staff.ts, patients.ts,
   keeping their existing string IDs.
3. Rewrite doctors.service.ts, users.service.ts, patients.service.ts against
   Supabase, keeping exported method names identical (incl. usersService.getByRole).
4. Point any remaining mock references in auth.service.ts / login-page.tsx at the new tables.
```

**MANUAL — after:**
- Run the migration + seed, then finish linking test users' `profiles.doctor_id`/`staff_id` from Phase 1.

**VERIFY:** Patients list, Admin → Doctors, Admin → Receptionists load real rows; edits persist after refresh.

---

## Phase 3 — Scheduling — appointments & calendar

**Session:** New · Claude Code CLI

**PROMPT — paste as-is:**
```
Move appointments to Supabase.
1. Migration: appointments table matching the Appointment interface,
   patient_id/doctor_id FK'd to patients/doctors, treatment_plan_id as a plain
   nullable text column (FK added in Phase 4). RLS: any authenticated staff
   member selects/inserts/updates all appointments.
2. Rewrite appointments.service.ts and calendar.service.ts against Supabase,
   same exported signatures.
3. Seed from src/mocks/appointments.ts, reusing existing IDs.
```

**VERIFY:** Day/week/month calendar and Appointments page show real data; new bookings persist after refresh.

---

## Phase 4 — Clinical records

**Session:** New · Claude Code CLI

Treatment plans, chart entries, prescriptions.

**PROMPT — paste as-is:**
```
Move clinical records to Supabase.
1. Migration: treatment_plans (stages jsonb), chart_entries, prescriptions
   (medicines jsonb), all FK'd to patients/doctors. Backfill the
   treatment_plan_id FK on appointments from Phase 3. RLS: any staff selects;
   only the owning doctor or an admin inserts/updates chart_entries and
   prescriptions (receptionists stay read-only on clinical data).
2. Rewrite treatment-plans.service.ts, chart-entries.service.ts,
   prescriptions.service.ts against Supabase, same exported shapes.
3. Seed from the matching src/mocks/*.ts files, reusing existing IDs.
```

**VERIFY:** Treatment Plans page, patient clinical tabs, Prescriptions page persist data across refresh.

---

## Phase 5 — Image storage

**Session:** New · Claude Code interface (verify the upload + thumbnail visually)

**MANUAL — before:**
- Storage → Create bucket → name it `patient-images`, set Private.

**PROMPT — paste as-is:**
```
Wire patient image uploads to Supabase Storage.
1. Migration: patient_images table matching PatientImage minus the `hue` field
   (that was a mock-only thumbnail hack), plus storage_path text and
   annotations jsonb. RLS: any staff selects/inserts; only an admin or the
   uploading doctor deletes.
2. Storage policy on patient-images restricting access to authenticated users.
3. Rewrite images.service.ts: create() now accepts a real File (wire
   upload-image-dialog.tsx to a real file input if needed), uploads to
   patients/{patientId}/{filename}, inserts the metadata row with the storage
   path. Add getSignedUrl(path) and use it wherever thumbnails render.
```

**VERIFY:** Upload an image from a patient's Images tab, confirm it's in Storage, thumbnail renders after a full refresh.

---

## Phase 6 — Billing — invoices

**Session:** New · Claude Code CLI

**PROMPT — paste as-is:**
```
Move billing to Supabase.
1. Migration: invoices table matching Invoice, items jsonb, FK'd to patients.
   RLS: any authenticated staff selects/inserts/updates.
2. Rewrite invoices.service.ts against Supabase.
3. Seed from src/mocks/invoices.ts, reusing existing IDs.
```

**VERIFY:** Billing page and a patient's Invoices tab persist totals; recording a payment updates paid/status after refresh.

---

## Phase 7 — Messaging + Realtime

**Session:** New · Claude Code interface (two-tab live test)

**PROMPT — paste as-is:**
```
Move the messaging inbox to Supabase with live updates.
1. Migration: conversations, chat_messages, internal_notes, attachments
   tables matching their interfaces — normalize into FK'd tables (not jsonb)
   since messages need independent realtime inserts. RLS: any staff
   selects/inserts on all four; only a note's author or admin updates/deletes
   internal_notes.
2. Rewrite chat.service.ts (sendMessage, markRead, assign, updateStatus,
   addInternalNote, addAttachment) against Supabase. Keep simulateReply as a
   manual dev helper.
3. Add subscribeToConversation(conversationId, onMessage) via
   supabase.channel(...).on('postgres_changes', ...), wire into inbox-page.tsx.
4. Seed from src/mocks/conversations.ts, reusing existing IDs.
```

**MANUAL — after:**
- Database → Replication — enable Realtime for `chat_messages` (and `conversations` if you want live status/assignee too).

**VERIFY:** Two browser sessions, different roles: a message sent in one appears live in the other with no refresh.

---

## Phase 8 — Ops tables

**Session:** New · Claude Code CLI

Reminders, broadcasts, message templates, escalations, notifications, audit log.

**PROMPT — paste as-is:**
```
Move the remaining operational tables to Supabase.
1. Migration: reminders, broadcasts, message_templates, escalations (comments
   jsonb, history jsonb), notifications, audit_log — matching their interfaces,
   FK'd where relevant. RLS: any staff selects/inserts on all six; restrict
   broadcast approval (status → approved/rejected) to doctors and admins.
2. Rewrite reminders.service.ts, broadcasts.service.ts, templates.service.ts,
   escalations.service.ts, notifications.service.ts, audit-log.service.ts
   against Supabase, same exported shapes.
3. Seed from the matching src/mocks/*.ts files, reusing existing IDs.
```

**VERIFY:** Reminder queue, broadcast approvals, escalations board, templates, notifications bell persist after refresh.

---

## Phase 9 — Settings & permissions matrix

**Session:** New · Claude Code CLI

**PROMPT — paste as-is:**
```
Move clinic settings and the roles/permissions matrix to Supabase.
1. Migration: single-row clinic_settings table (ClinicProfile +
   WhatsAppConfig fields, or two singleton tables) and permissions_matrix
   (module name, role, allowed boolean) matching src/mocks/permissions.ts.
   RLS: any authenticated user selects; only admins update.
2. Rewrite settings.service.ts against Supabase. Move
   getPermissionsMatrix/getRoleKeys/updatePermission out of auth.service.ts
   into Supabase-backed queries, keeping them exported from auth.service.ts.
3. Seed one settings row and the default permissions matrix.
```

**VERIFY:** Settings page (Clinic Profile, WhatsApp Config) and Admin → Roles read/write real, persisted data.

---

## Phase 10 — AI & voice — optional

**Session:** New · Claude Code CLI (only if pursuing real AI calls)

`ai.service.ts` / `voice.service.ts` are keyword-matched canned logic today — nothing is "broken." Skip this phase entirely unless you want real LLM output.

**MANUAL — before:**
- `supabase functions new draft-reply` (repeat per feature); `supabase secrets set OPENAI_API_KEY=...`; `supabase functions deploy draft-reply` once written.

**PROMPT — paste as-is:**
```
Replace aiService.suggestReply in src/services/ai.service.ts with a call to a
new Supabase Edge Function `draft-reply` that takes the conversation history
and returns a drafted reply using [name the provider]. Create it under
supabase/functions/draft-reply/index.ts, reading the API key from a Supabase
secret — never hardcode it. Keep suggestReply's exported signature identical.
Repeat this pattern for summarizeConversation, generateTreatmentSummary,
draftPrescription, and voiceService.generateStructuredChart when ready.
```

**VERIFY:** N/A — optional phase, verify per feature as you adopt it.

---

## Phase 11 — Hardening & deploy

**Session:** New · Claude Code CLI

**PROMPT — paste as-is:**
```
Write supabase/POLICIES.md summarizing every table's RLS policies in one line
each (table, operation, who's allowed), pulled from supabase/migrations/. Then
remove src/mocks/ and the createCrudService helper from src/services/types.ts —
confirm no remaining src/services/*.ts file imports from src/mocks first.
```

**MANUAL — after:**
- Authentication → Settings — turn "Confirm email" back on.
- Rotate the anon key if it was ever shared/pasted publicly.
- Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to your host's env vars (Vercel/Netlify) — never commit `.env`.
- Once real patient data is in, enable daily backups / point-in-time recovery and re-read the compliance callout above.
- Read `supabase/POLICIES.md` and confirm every line matches what you intended — last checkpoint before real records go in.

**VERIFY:** `npm run build` succeeds with no references to `src/mocks`; deployed app authenticates and loads data against the live project.

---

End of blueprint — twelve phases, each shippable and testable on its own.
