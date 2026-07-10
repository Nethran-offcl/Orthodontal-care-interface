# Sunrise Dental — Clinic OS

A high-fidelity, fully interactive prototype of a dental clinic management system, built from the
project's Phase 1 UX blueprint. Every screen is real and clickable; all data is mocked and held in
memory (no backend, no persistence between reloads).

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** with a custom design-token theme (light/dark)
- **shadcn/ui**-style primitives (Radix UI underneath, hand-added rather than CLI-generated)
- **Framer Motion** for route/element transitions
- **Lucide React** for icons
- **React Router** for client-side routing

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. `npm run build` produces a production bundle; `npm run preview` serves it.

## Trying it out

There's no login — a **role switcher** lives in the profile menu (top-right avatar) and in the
command palette (`⌘K` / `Ctrl K`). Switch between **Doctor**, **Front Desk / Admin**, and **Patient**
to see how the dashboard, sidebar, and available actions change per role. This mirrors a real
decision from the UX blueprint: patients in this product never get a login — every patient
touchpoint is WhatsApp — so "Patient view" here is a preview of what that experience *could* look
like, not a shipped feature.

A few flows worth trying end to end:

- **Voice-to-chart** — open a today's-schedule appointment → *Start consultation* → record (or type
  manually) → review the AI-structured chart fields → confirm → prescribe → advance the treatment
  plan → attach a photo → finish. The chart entry, prescription, and appointment status all update
  live.
- **Follow-up reminders** — `Messaging → Reminders` shows the auto-generated queue, driven by each
  patient's treatment plan, plus a "needs a phone call" worklist for reminders that went
  unanswered.
- **Broadcasts** — `Messaging → Broadcasts` enforces the doctor-approval gate from the SOP: draft →
  submit → doctor approves/rejects → send.

## Project structure

```
src/
  app/            App-level providers (theme, toasts, tooltips, mock data store)
  components/
    ui/           shadcn-style primitives (button, dialog, sheet, tabs, command palette, …)
    layout/       App shell: sidebar, topbar, command palette, notifications panel, profile menu
    shared/       Reusable feature components: status badges, avatars, chat thread, bar charts, …
  data/           Mock data + types — realistic patients, doctors, appointments, treatment plans,
                  invoices, WhatsApp conversations, reminders, broadcasts, templates
  state/          React context: the in-memory "clinic store" (all mutations) and UI/app state
                  (current role, command palette, sidebar collapse, …)
  pages/          One folder per module — dashboard, appointments, patients, consultation,
                  messaging, billing, reports, settings — each with its own dialogs and tabs
```

All interactive state (appointments, chart entries, prescriptions, treatment plans, invoices,
conversations, broadcasts, notifications) lives in `state/store.tsx` and resets on page reload —
this is a prototype, not a persisted backend.
