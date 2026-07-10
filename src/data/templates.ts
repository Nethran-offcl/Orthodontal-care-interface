import type { MessageTemplate } from './types'

export const messageTemplates: MessageTemplate[] = [
  {
    id: 'TPL-1',
    name: 'Follow-up Reminder — Patient',
    category: 'Reminder',
    body: 'Hi {{patient_name}}, this is a reminder from Sunrise Dental that your follow-up visit with {{doctor_name}} is scheduled for {{date}} at {{time}}. Please reply YES to confirm or call us to reschedule.',
    approvalStatus: 'approved',
    language: 'English',
    usedCount: 486,
  },
  {
    id: 'TPL-2',
    name: 'Follow-up Reminder — Doctor Copy',
    category: 'Reminder',
    body: 'Reminder: {{patient_name}} (Patient ID: {{patient_id}}) has a follow-up scheduled {{date}} at {{time}}.',
    approvalStatus: 'approved',
    language: 'English',
    usedCount: 486,
  },
  {
    id: 'TPL-3',
    name: 'Appointment Confirmation Reply',
    category: 'Confirmation',
    body: 'Thank you, {{patient_name}}! Your appointment on {{date}} at {{time}} is confirmed. We look forward to seeing you.',
    approvalStatus: 'approved',
    language: 'English',
    usedCount: 402,
  },
  {
    id: 'TPL-4',
    name: 'Reschedule Acknowledgment',
    category: 'Reschedule',
    body: 'No problem, {{patient_name}}. Your appointment has been moved to {{new_date}} at {{new_time}}. See you then!',
    approvalStatus: 'approved',
    language: 'English',
    usedCount: 118,
  },
  {
    id: 'TPL-5',
    name: 'Broadcast — Holiday Closure',
    category: 'Broadcast',
    body: 'Dear {{patient_name}}, {{clinic_name}} will be closed on {{date}} for {{reason}}. We will resume regular hours on {{resume_date}}. Wishing you good health!',
    approvalStatus: 'approved',
    language: 'English',
    usedCount: 6,
  },
  {
    id: 'TPL-6',
    name: 'Broadcast — General Announcement',
    category: 'Broadcast',
    body: 'Dear {{patient_name}}, {{message_body}}',
    approvalStatus: 'approved',
    language: 'English',
    usedCount: 9,
  },
  {
    id: 'TPL-7',
    name: 'Follow-up Reminder — Kannada',
    category: 'Reminder',
    body: '{{patient_name}} ಅವರೇ, {{doctor_name}} ಅವರೊಂದಿಗಿನ ನಿಮ್ಮ ಫಾಲೋ-ಅಪ್ ಭೇಟಿ {{date}} ರಂದು {{time}} ಗೆ ನಿಗದಿಯಾಗಿದೆ.',
    approvalStatus: 'pending',
    language: 'Kannada',
    usedCount: 0,
  },
]

export function getTemplate(id: string) {
  return messageTemplates.find((t) => t.id === id)
}
