# Migrations

Each phase of `backend_blueprint.md` adds one numbered SQL file here, e.g. `0001_profiles.sql`, `0002_directory.sql`.

## Applying a migration

Pick whichever fits how you're set up — both apply the same SQL.

**Option A — Supabase dashboard SQL editor (no CLI needed)**
1. Open the project at supabase.com → SQL Editor.
2. Paste the contents of the new migration file.
3. Run it. Supabase Auth/Storage/RLS changes take effect immediately.

**Option B — Supabase CLI**
```
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```
`db push` applies any migration files here that haven't been applied yet, in filename order — hence the numeric prefixes.

## Conventions

- Filenames sort in the order they must run: `0001_`, `0002_`, … one file per blueprint phase (a phase may need more than one file if it's large).
- Every table gets `id text primary key default gen_random_uuid()::text` unless the blueprint says otherwise (e.g. `profiles.id` mirrors `auth.users.id`).
- Enable RLS on every table (`alter table … enable row level security;`) and add explicit policies — never leave a table open by omission.
- Seed data lives in `supabase/seed.sql`, added starting Phase 2, reusing the existing mock string IDs so relationships stay intact.
