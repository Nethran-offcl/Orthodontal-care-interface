# Backend Blueprint Part 2 — Messaging, WhatsApp & LLM — Sunrise Dental Clinic OS

Continuation of `backend_blueprint.md`. That document's Phases 0–6 and 8 are done — real
Supabase now backs auth, the directory, scheduling, clinical records, image storage,
billing, and ops tables. This document picks up everything still left: the deferred
Phase 7 (messaging), the deferred Phase 9 (settings/permissions), and everything neither
document covered yet — actually wiring WhatsApp send/receive, and replacing the canned
AI/voice logic with real LLM calls.

Same rules as Part 1: one phase, one job, new Claude Code session per phase by default,
paste each `PROMPT` as-is, do `MANUAL` steps yourself, don't move on until `VERIFY` passes.
**Work top to bottom — every phase here assumes the previous one in this document landed.**

**Every external service in this document is free to build and test against** — no paid
subscription, credit card, or paid API tier is required to complete any phase:
- **Meta WhatsApp Cloud API direct** — no BSP (Gupshup/Twilio/360dialog all charge a
  subscription + per-message markup on top of Meta's own fees). Meta's Cloud API itself has no
  platform fee, and a **test phone number with up to 5 verified recipient numbers is free and
  unlimited** — enough to build and demo all of Phases 9–11 at $0. (Sending to real patients at
  real volume beyond free categories is a per-message cost Meta charges directly regardless of
  which path you pick — that's a "going live" decision for later, not something this document
  needs you to pay for.)
- **Groq** for every LLM/voice call in Phase 12 — free API key, no credit card, generous rate
  limits (easily enough for one dental clinic's message volume), hosts both free open-weight chat
  models (for text) and Whisper (for transcription) under the same key, so there's only one
  provider and one secret to manage instead of two.

## Fixed decisions (carried over, plus new ones for this document)

- Same ID/jsonb/migration conventions as Part 1 (`supabase/migrations/`, sequential numbers
  continuing from `0008_ops_tables.sql`).
- Row mapping convention already established in every Supabase-backed service
  (`appointments.service.ts` is the reference): a private `RowType` interface, `fromRow`/`toRow`
  functions converting snake_case ⇄ camelCase, methods throwing on `{ error }`. Match it.
- **Secrets never go in a database table.** Provider tokens (WhatsApp, Groq) are Supabase Edge
  Function secrets (`supabase secrets set`), read via
  `Deno.env.get(...)` inside the function. The `whatsapp_config`/`clinic_settings` table from
  Phase 9 is UI-facing display config only (provider name shown in Settings, phone number shown
  to staff, automation toggles) — it is not where credentials live.
- **Edge Functions** live in `supabase/functions/<name>/index.ts`, deployed with
  `supabase functions deploy <name>`.

## Current repo state this document targets

Verified against the working tree at the time this document was written:

- `src/services/chat.service.ts` still runs on `createCrudService` (mock) — the only remaining
  consumer of that helper. `src/services/settings.service.ts` still holds a plain in-memory
  object; `getPermissionsMatrix`/`updatePermission`/`getRoleKeys` in `auth.service.ts` still read
  `src/mocks/permissions.ts`.
- `supabase/migrations/0008_ops_tables.sql` already created `escalations.conversation_id` as a
  **plain, un-FK'd** text column with a comment saying to link it once messaging exists — that
  happens in Phase 7 below.
- `src/services/ai.service.ts` and `src/services/voice.service.ts` are 100% keyword-matched /
  templated canned logic — no LLM call exists anywhere in the repo.
- `src/services/broadcasts.service.ts`'s `sendNow()` fakes delivered/read counts
  (`audienceCount * 0.97`, `delivered * 0.6`) instead of calling any messaging API. No WhatsApp
  provider, webhook, or Edge Function exists anywhere in the repo — `whatsappConfig.ts` is
  display-only mock data, never actually used to send anything.
- Relevant current types (`src/types/index.ts`): `Conversation`, `ChatMessage`, `InternalNote`,
  `Attachment`, `Broadcast`, `MessageTemplate` — read these before writing any migration below,
  in case they've drifted since.

---

## Phase 7 — Messaging + Realtime

**Session:** New · Claude Code interface (two-tab live test)

*(This is Part 1's deferred Phase 7, restated with the current repo state above — including the
`escalations.conversation_id` backfill it left waiting.)*

**PROMPT — paste as-is:**
```
Move the messaging inbox to Supabase with live updates.
1. Migration: conversations, chat_messages, internal_notes, attachments tables
   matching their interfaces in src/types/index.ts — normalize into FK'd tables
   (not jsonb) since messages need independent realtime inserts. FK chat_messages/
   internal_notes/attachments to conversations. Add the foreign key from
   escalations.conversation_id to conversations(id) now that the table exists
   (see the comment above that column in supabase/migrations/0008_ops_tables.sql).
   RLS: any staff selects/inserts on all four; only a note's author or admin
   updates/deletes internal_notes.
2. Rewrite chat.service.ts (sendMessage, markRead, assign, updateStatus,
   addInternalNote, addAttachment) against Supabase, same exported signatures.
   Keep simulateReply as a manual dev helper for now — Phase 11 below replaces
   real inbound messages with an actual WhatsApp webhook.
3. Add subscribeToConversation(conversationId, onMessage) via
   supabase.channel(...).on('postgres_changes', ...), wire into inbox-page.tsx.
4. Seed from src/mocks/conversations.ts, reusing existing IDs.
```

**MANUAL — after:**
- Database → Replication — enable Realtime for `chat_messages` (and `conversations` if you want
  live status/assignee too).

**VERIFY:** Two browser sessions, different roles: a message sent in one appears live in the
other with no refresh.

---

## Phase 8 — Settings & permissions matrix

**Session:** New · Claude Code CLI

*(Part 1's deferred Phase 9, restated — renumbered here since Part 1 already has a Phase 9 slot
reserved in its own numbering; treat this document's numbering as authoritative going forward.)*

**PROMPT — paste as-is:**
```
Move clinic settings and the roles/permissions matrix to Supabase.
1. Migration: single-row clinic_settings table (ClinicProfile + WhatsAppConfig
   fields, or two singleton tables) and permissions_matrix (module name, role,
   allowed boolean) matching src/mocks/permissions.ts. RLS: any authenticated
   user selects; only admins update.
2. Rewrite settings.service.ts against Supabase. Move
   getPermissionsMatrix/getRoleKeys/updatePermission out of auth.service.ts into
   Supabase-backed queries, keeping them exported from auth.service.ts.
3. Seed one settings row and the default permissions matrix.
```

**VERIFY:** Settings page (Clinic Profile, WhatsApp Config) and Admin → Roles read/write real,
persisted data.

---

## Phase 9 — WhatsApp: outbound sending

**Session:** New · Claude Code interface (send a real message to your own phone)

First real connection to WhatsApp. Everything before this phase only prepared the ground
(real `chat_messages` table, real settings table) — nothing has sent a real WhatsApp message yet.

**MANUAL — before:**
- Create a Meta developer app (developers.facebook.com) → add the WhatsApp product. This gives
  you a **free test phone number** for no cost — no business verification, no card on file.
- Add up to 5 of your own numbers as verified test recipients (WhatsApp → API Setup → "To" field)
  — free, unlimited messages to those numbers, which is exactly what you need to build and verify
  every phase in this document before ever touching a real customer number.
- Note the test number's `phone_number_id`, and generate a permanent access token (Business
  Settings → System Users → generate token scoped to `whatsapp_business_messaging`, not the
  24-hour temporary token that pre-fills on the API Setup page).
- `supabase secrets set WHATSAPP_TOKEN=... WHATSAPP_PHONE_NUMBER_ID=...`.
- Update `whatsappConfig.ts`'s `provider` field (and the Phase 8 `clinic_settings` row once it
  exists) to say `'Meta Cloud API'` instead of the old `'Gupshup'` placeholder — there's no BSP in
  this path.

**PROMPT — paste as-is:**
```
Create a Supabase Edge Function supabase/functions/send-whatsapp-message/index.ts
that accepts { to: string, body: string } (E.164 phone number, plain text) and
sends it via the WhatsApp Cloud API — POST to
https://graph.facebook.com/v22.0/{WHATSAPP_PHONE_NUMBER_ID}/messages with a
Bearer token — reading WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID from Deno.env,
never hardcoded. Return the provider's message id.

Add a provider_message_id text column to chat_messages via a small migration.
Rewrite chatService.sendMessage in src/services/chat.service.ts: after inserting
the outbound chat_messages row (status 'sent'), invoke this Edge Function via
supabase.functions.invoke('send-whatsapp-message', ...) using the patient's phone
number, store the returned provider_message_id, and set status to 'failed' if the
call errors. Wire the reminder-send action in reminders.service.ts and
broadcastsService.sendNow through the same Edge Function instead of the current
fake delivered/read math (send once per recipient for broadcasts; a real
delivered/read count comes from Phase 11's webhook, not from a guess anymore).
```

**VERIFY:** Send a message from a patient's chat thread in the Communication Center to one of your
verified test recipient numbers; it arrives within seconds, at no cost.

---

## Phase 10 — WhatsApp: inbound webhook + delivery receipts

**Session:** New · Claude Code CLI, then MANUAL dashboard wiring

Real patient replies and real delivery/read status, instead of `simulateReply` and faked
percentages.

**MANUAL — before:**
- `supabase secrets set WHATSAPP_VERIFY_TOKEN=... WHATSAPP_APP_SECRET=...` (a verify token you
  invent, plus the app secret from Meta's Basic Settings — needed to validate incoming webhook
  signatures).

**PROMPT — paste as-is:**
```
Create supabase/functions/whatsapp-webhook/index.ts:
1. GET handler: echo the hub.challenge query param when hub.verify_token matches
   WHATSAPP_VERIFY_TOKEN (Deno.env), else return 403. This satisfies Meta's
   one-time webhook verification handshake.
2. POST handler: verify the X-Hub-Signature-256 header against the raw request
   body using HMAC-SHA256 with WHATSAPP_APP_SECRET, rejecting on mismatch. Parse
   the payload's message entries: match the sender's phone number to
   patients.phone, find that patient's conversation (create one if none exists,
   channel 'whatsapp'), insert a chat_messages row (sender 'patient', text, time,
   provider_message_id), bump conversations.unread and lastMessageAt.
3. Also handle `statuses` entries (sent/delivered/read/failed) by updating the
   matching chat_messages.status via provider_message_id. When every message in a
   broadcast batch reaches delivered/read, update that broadcast's
   delivered_count/read_count in broadcasts (replacing the fake math from
   Phase 9).
No service file changes needed beyond this — the Phase 7 realtime subscription
already picks up new chat_messages rows automatically.
```

**MANUAL — after:**
- Deploy: `supabase functions deploy whatsapp-webhook`.
- In Meta's dashboard (WhatsApp → Configuration), set the webhook URL to the deployed function's
  URL, enter the same verify token, confirm the handshake succeeds, then subscribe to the
  `messages` field (and `message_template_status_update` if you want template approval events
  too — see Phase 11).

**VERIFY:** Text the clinic's WhatsApp number from your own phone — it appears live in the inbox
with no refresh. Sending a message from the inbox shows its status move to delivered/read as your
phone actually receives and opens it.

---

## Phase 11 — WhatsApp: templates & business-initiated messages

**Session:** New · Claude Code CLI

WhatsApp requires a **pre-approved template** for any business-initiated message sent outside a
24-hour window since the customer's last message — this covers reminders, broadcasts, and any
proactive follow-up, which is most of what this clinic actually needs to send.

**MANUAL — before:**
- In Meta Business Manager, submit each message you want to send proactively — reminder
  confirmations, appointment confirmations, reschedule acks, broadcast announcements (the four
  categories already in `message_templates`) — as a real template for approval. Template
  submission and approval are free; note the registered template name and language code Meta
  assigns each one. (Templates send fine to your verified test recipient numbers from Phase 9 —
  no need for a live production number to test this phase either.)

**PROMPT — paste as-is:**
```
Add template_name text and provider_status text columns to message_templates via
a migration (provider_status distinct from the existing approval_status: this
one mirrors exactly what Meta returns). Update send-whatsapp-message to accept
either { to, body } (free text, only valid inside the 24h session window) or
{ to, templateName, templateParams } (Meta's template message format, required
outside that window). Wire remindersService's send action and
broadcastsService.sendNow to look up the matching approved message_templates row
and send via templateName + templateParams instead of raw body text. Add an
admin action (Messaging → Templates page) that calls Meta's template list/status
endpoint and syncs provider_status + approval_status for every row.
```

**VERIFY:** A reminder sent to a patient who hasn't messaged the clinic in the last 24 hours
still delivers, using the approved template.

---

## Phase 12 — Real LLM calls (AI & voice)

**Session:** New · Claude Code CLI

Replaces every canned/keyword-matched method in `ai.service.ts` and the transcript-structuring
half of `voice.service.ts` with real model calls, using **Groq** — free API key, no credit card,
and the same key covers both needs this phase has:
- **Chat models** (Llama 3.3 70B Versatile for quality, Llama 3.1 8B Instant where you want
  lower latency) for every text-generation method in `ai.service.ts`.
- **Whisper Large v3 Turbo**, also hosted free on Groq, for real audio transcription — so there's
  no second STT vendor/account/key to manage.

**MANUAL — before:**
- Create a free account at console.groq.com, generate an API key (no card required).
- `supabase secrets set GROQ_API_KEY=...`.

**PROMPT — paste as-is:**
```
Replace every canned method in src/services/ai.service.ts with a call to a new
Supabase Edge Function, using Groq's OpenAI-compatible chat completions endpoint
(https://api.groq.com/openai/v1/chat/completions, model llama-3.3-70b-versatile,
or llama-3.1-8b-instant where latency matters more than quality) with
GROQ_API_KEY read from Deno.env — never hardcoded:
- suggestReply           → supabase/functions/suggest-reply
- summarizeConversation  → supabase/functions/summarize-conversation
- generateTreatmentSummary → supabase/functions/generate-treatment-summary
- draftPrescription      → supabase/functions/draft-prescription
- generateReminderMessage / generateFollowUpMessage → supabase/functions/draft-message
- answerKnowledgeQuestion → supabase/functions/answer-knowledge-question
Keep every method's exported signature identical so no page component changes.
recommendedActionsFor and suggestAppointmentSlot are plain business-rule logic,
not AI text generation — leave them as-is.

Then replace voiceService.simulateTranscription + generateStructuredChart:
create supabase/functions/transcribe-audio (posts the recorded audio to Groq's
https://api.groq.com/openai/v1/audio/transcriptions endpoint, model
whisper-large-v3-turbo, using the same GROQ_API_KEY, returns the raw transcript)
and supabase/functions/structure-chart (calls the same Groq chat completions
endpoint with the transcript, prompted to return JSON matching the
StructuredChart shape). Update voice-recording-step.tsx to call transcribe then
structure in sequence instead of the simulated delay + template lookup, keeping
voiceService's exported function names identical.
```

**VERIFY:** Per feature — a drafted reply in the Communication Center reads like a real model
response to that specific conversation (not a keyword-matched template); a recorded consultation
produces an actual transcript of what was said, structured into chart fields by the model — all at
no cost.

---

## Phase 13 — Hardening & deploy

**Session:** New · Claude Code CLI

Same job as Part 1's Phase 11, now that every mock is actually gone.

**PROMPT — paste as-is:**
```
Write supabase/POLICIES.md summarizing every table's RLS policies in one line
each (table, operation, who's allowed), pulled from supabase/migrations/ —
including conversations, chat_messages, internal_notes, attachments,
clinic_settings, and permissions_matrix from this document's phases. Add a
supabase/EDGE_FUNCTIONS.md listing every deployed function, its purpose, and
which secrets it reads (name the secret, never its value). Then remove
src/mocks/ and the createCrudService helper from src/services/types.ts —
confirm no remaining src/services/*.ts file imports from src/mocks first.
```

**MANUAL — after:**
- Authentication → Settings — turn "Confirm email" back on (if not already done in Part 1).
- Rotate every secret that was ever pasted somewhere public: Supabase anon key, WhatsApp token +
  app secret, Groq API key.
- Add all `VITE_*` env vars to your host's env vars (Vercel/Netlify) — never commit `.env`.
- Re-confirm the compliance callout from Part 1 now that real conversations and phone numbers are
  flowing through WhatsApp too.
- Read `supabase/POLICIES.md` and `supabase/EDGE_FUNCTIONS.md` — last checkpoint before this goes
  live with real patients.

**VERIFY:** `npm run build` succeeds with no references to `src/mocks`; deployed app sends and
receives a real WhatsApp message end-to-end and drafts a real AI reply.

---

End of Part 2 — seven phases, continuing directly from where Part 1 left off.
