import type { AuditLogEntry } from '@/types'
import { dateTimeAt } from '@/lib/date'

export const auditLog: AuditLogEntry[] = [
  {
    id: 'AL-1',
    actor: 'Priya Kulkarni',
    action: 'Rescheduled appointment',
    target: 'Vikram Singh — Crown fitting',
    time: dateTimeAt(0, 8, 12),
  },
  {
    id: 'AL-2',
    actor: 'Dr. Arjun Rao',
    action: 'Confirmed chart entry from voice transcript',
    target: 'Meera Nair — Root canal, stage 2',
    time: dateTimeAt(0, 9, 40),
  },
  {
    id: 'AL-3',
    actor: 'Priya Kulkarni',
    action: 'Recorded payment',
    target: 'INV-8002 — ₹200 received',
    time: dateTimeAt(0, 9, 45),
  },
  {
    id: 'AL-4',
    actor: 'Dr. Kavya Menon',
    action: 'Rejected broadcast',
    target: '20% Off Teeth Whitening — Festive Offer',
    time: dateTimeAt(-12, 16, 30),
  },
  {
    id: 'AL-5',
    actor: 'Priya Kulkarni',
    action: 'Added new patient',
    target: 'Ananya Das — PT-1010',
    time: dateTimeAt(-3, 12, 5),
  },
  {
    id: 'AL-6',
    actor: 'Dr. Arjun Rao',
    action: 'Updated treatment plan',
    target: 'Rohan Verma — Implant placement stage 2 added',
    time: dateTimeAt(-45, 15, 0),
  },
  {
    id: 'AL-7',
    actor: 'System',
    action: 'Sent nightly follow-up reminders',
    target: '6 reminders dispatched via WhatsApp',
    time: dateTimeAt(-1, 9, 0),
  },
  {
    id: 'AL-8',
    actor: 'Priya Kulkarni',
    action: 'Updated WhatsApp message template',
    target: 'Follow-up Reminder — Kannada (submitted for approval)',
    time: dateTimeAt(-2, 11, 20),
  },
]
