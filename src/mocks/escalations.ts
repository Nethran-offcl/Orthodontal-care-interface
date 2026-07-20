import type { Escalation } from '@/types'
import { dateTimeAt } from '@/lib/date'

export const escalations: Escalation[] = [
  {
    id: 'ESC-1',
    conversationId: 'CV-9004',
    patientId: 'PT-1011',
    reason: 'No response to reminder or follow-up calls for periodontal maintenance visit — third missed contact attempt.',
    priority: 'high',
    assignedRole: 'receptionist',
    assignedToId: 'staff-priya',
    status: 'in-progress',
    createdAt: dateTimeAt(-2, 11, 5),
    createdBy: 'Priya Kulkarni',
    comments: [
      {
        id: 'ECM-1',
        author: 'Priya Kulkarni',
        text: 'Tried calling twice, both unanswered. Will try again tomorrow morning before marking as lost.',
        time: dateTimeAt(-2, 11, 10),
      },
    ],
    history: [
      { id: 'EH-1', action: 'Escalation created', actor: 'Priya Kulkarni', time: dateTimeAt(-2, 11, 5) },
      { id: 'EH-2', action: 'Assigned to Priya Kulkarni', actor: 'Priya Kulkarni', time: dateTimeAt(-2, 11, 5) },
      { id: 'EH-3', action: 'Marked in progress', actor: 'Priya Kulkarni', time: dateTimeAt(-2, 11, 10) },
    ],
  },
  {
    id: 'ESC-2',
    conversationId: 'CV-9001',
    patientId: 'PT-1001',
    reason: 'Patient reporting post-procedure cold sensitivity after root canal sitting — needs clinical judgement before replying.',
    priority: 'medium',
    assignedRole: 'doctor',
    assignedToId: 'doc-rao',
    status: 'resolved',
    createdAt: dateTimeAt(0, 8, 12),
    createdBy: 'Priya Kulkarni',
    comments: [
      {
        id: 'ECM-2',
        author: 'Dr. Arjun Rao',
        text: 'Mild sensitivity is expected post-obturation. Replied with reassurance and advised to monitor for 48 hours.',
        time: dateTimeAt(0, 8, 20),
      },
    ],
    history: [
      { id: 'EH-4', action: 'Escalation created', actor: 'Priya Kulkarni', time: dateTimeAt(0, 8, 12) },
      { id: 'EH-5', action: 'Assigned to Dr. Arjun Rao', actor: 'Priya Kulkarni', time: dateTimeAt(0, 8, 12) },
      { id: 'EH-6', action: 'Marked resolved', actor: 'Dr. Arjun Rao', time: dateTimeAt(0, 8, 21) },
    ],
  },
  {
    id: 'ESC-3',
    patientId: 'PT-1003',
    reason: 'Patient disputing implant invoice charges — requesting an itemized breakdown and asking about a possible discount.',
    priority: 'high',
    assignedRole: 'admin',
    assignedToId: 'staff-meera',
    status: 'open',
    createdAt: dateTimeAt(-1, 14, 40),
    createdBy: 'Priya Kulkarni',
    comments: [],
    history: [
      { id: 'EH-7', action: 'Escalation created', actor: 'Priya Kulkarni', time: dateTimeAt(-1, 14, 40) },
      { id: 'EH-8', action: 'Assigned to Meera Iyer', actor: 'Priya Kulkarni', time: dateTimeAt(-1, 14, 40) },
    ],
  },
  {
    id: 'ESC-4',
    patientId: 'PT-1006',
    reason: 'Patient wanted the reschedule/cancellation policy explained before confirming a new date.',
    priority: 'low',
    assignedRole: 'receptionist',
    assignedToId: 'staff-anil',
    status: 'resolved',
    createdAt: dateTimeAt(-5, 10, 0),
    createdBy: 'Priya Kulkarni',
    comments: [
      {
        id: 'ECM-3',
        author: 'Anil Deshmukh',
        text: 'Explained the 24-hour reschedule window over the phone, patient confirmed the new slot.',
        time: dateTimeAt(-5, 10, 30),
      },
    ],
    history: [
      { id: 'EH-9', action: 'Escalation created', actor: 'Priya Kulkarni', time: dateTimeAt(-5, 10, 0) },
      { id: 'EH-10', action: 'Assigned to Anil Deshmukh', actor: 'Priya Kulkarni', time: dateTimeAt(-5, 10, 0) },
      { id: 'EH-11', action: 'Marked resolved', actor: 'Anil Deshmukh', time: dateTimeAt(-5, 10, 30) },
    ],
  },
]
