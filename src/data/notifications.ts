import type { AppNotification } from './types'
import { dateTimeAt } from './dates'

export const notifications: AppNotification[] = [
  {
    id: 'N-1',
    title: 'Broadcast awaiting your approval',
    description: '"Ganesh Chaturthi Closure Notice" needs review before it can send to 320 patients.',
    time: dateTimeAt(0, 8, 45),
    read: false,
    type: 'broadcast',
    href: '/messaging/broadcasts',
  },
  {
    id: 'N-2',
    title: 'No response to follow-up reminder',
    description: 'Ramesh Gupta missed his periodontal maintenance visit and hasn\'t replied to the reminder.',
    time: dateTimeAt(-3, 15, 30),
    read: false,
    type: 'reminder',
    href: '/messaging/reminders',
  },
  {
    id: 'N-3',
    title: 'Reschedule requested',
    description: 'Vikram Singh asked to move tomorrow\'s crown fitting from 10:00 AM to 11:00 AM.',
    time: dateTimeAt(0, 7, 5),
    read: false,
    type: 'message',
    href: '/messaging',
  },
  {
    id: 'N-4',
    title: 'Payment recorded',
    description: '₹200 received from Meera Nair against INV-8002.',
    time: dateTimeAt(0, 9, 45),
    read: true,
    type: 'payment',
    href: '/billing',
  },
  {
    id: 'N-5',
    title: 'New patient registered',
    description: 'Ananya Das was added by Priya Kulkarni via quick onboarding.',
    time: dateTimeAt(-3, 12, 5),
    read: true,
    type: 'system',
    href: '/patients/PT-1010',
  },
  {
    id: 'N-6',
    title: 'Nightly reminders sent',
    description: '6 follow-up reminders were dispatched via WhatsApp for tomorrow\'s appointments.',
    time: dateTimeAt(-1, 9, 0),
    read: true,
    type: 'system',
    href: '/messaging/reminders',
  },
]

export function unreadCount() {
  return notifications.filter((n) => !n.read).length
}
