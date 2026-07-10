import type { Broadcast } from './types'
import { dateTimeAt, daysFromToday } from './dates'

export const broadcasts: Broadcast[] = [
  {
    id: 'BC-1',
    title: 'Independence Day Holiday Notice',
    message:
      'Dear {{patient_name}}, Sunrise Dental will be closed on 15th August for Independence Day. We will resume regular hours on 16th August. Wishing you good health!',
    audience: 'All active patients',
    audienceCount: 312,
    status: 'sent',
    createdBy: 'Priya Kulkarni',
    createdAt: dateTimeAt(-330, 11, 0),
    sentAt: dateTimeAt(-329, 9, 0),
    deliveredCount: 308,
    readCount: 261,
  },
  {
    id: 'BC-2',
    title: 'Monsoon Oral Care Tips',
    message:
      'Dear {{patient_name}}, the monsoon season can increase sensitivity and gum issues. A quick tip from Dr. Rao: rinse with warm salt water daily and avoid very cold food. Book a check-up if you notice any discomfort — link in our WhatsApp profile.',
    audience: 'All active patients',
    audienceCount: 318,
    status: 'sent',
    createdBy: 'Priya Kulkarni',
    createdAt: dateTimeAt(-40, 10, 0),
    sentAt: dateTimeAt(-39, 9, 0),
    deliveredCount: 315,
    readCount: 290,
  },
  {
    id: 'BC-3',
    title: 'Ganesh Chaturthi Closure Notice',
    message:
      'Dear {{patient_name}}, Sunrise Dental will be closed for Ganesh Chaturthi this Thursday and Friday. For emergencies, please call the clinic number. We will resume regular hours on Saturday.',
    audience: 'All active patients',
    audienceCount: 320,
    status: 'pending-approval',
    createdBy: 'Priya Kulkarni',
    createdAt: dateTimeAt(0, 8, 45),
  },
  {
    id: 'BC-4',
    title: 'New Saturday Evening Slots',
    message:
      'Dear {{patient_name}}, we now have Saturday evening slots (5–8 PM) available with Dr. Menon. Reply to this message to book one.',
    audience: 'Patients with pending follow-ups',
    audienceCount: 46,
    status: 'draft',
    createdBy: 'Priya Kulkarni',
    createdAt: dateTimeAt(0, 9, 30),
  },
  {
    id: 'BC-5',
    title: '20% Off Teeth Whitening — Festive Offer',
    message:
      'Dear {{patient_name}}, get 20% off professional teeth whitening this festive season! Limited slots, book now.',
    audience: 'All active patients',
    audienceCount: 320,
    status: 'rejected',
    createdBy: 'Priya Kulkarni',
    createdAt: dateTimeAt(-12, 14, 0),
    reviewNote:
      'Let\'s not run discount promotions over WhatsApp broadcast — it changes the tone of this channel. Happy to feature it on Instagram instead, with a proper offer page. — Dr. Rao',
  },
]

export function sortedBroadcasts() {
  return [...broadcasts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const upcomingHolidayContext = {
  nextClosure: daysFromToday(2),
}
