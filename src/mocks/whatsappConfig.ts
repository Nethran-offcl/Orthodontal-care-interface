export interface WhatsAppConfig {
  provider: string
  phone: string
  messageCategories: string[]
  automation: {
    sendReminders: boolean
    sendDoctorCopy: boolean
    requireApproval: boolean
    reminderLeadDays: boolean
  }
}

export const whatsappConfig: WhatsAppConfig = {
  provider: 'Gupshup',
  phone: '+91 80 4012 3456',
  messageCategories: [
    'Follow-up reminders',
    'Appointment confirmations',
    'Reschedule acknowledgments',
    'Broadcast announcements',
  ],
  automation: {
    sendReminders: true,
    sendDoctorCopy: true,
    requireApproval: true,
    reminderLeadDays: true,
  },
}
