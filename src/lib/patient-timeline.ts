import type {
  Appointment,
  ChartEntry,
  Conversation,
  Invoice,
  PatientImage,
  Prescription,
} from '@/data/types'
import { formatCurrency } from '@/lib/utils'

export type TimelineEventType = 'appointment' | 'chart' | 'image' | 'prescription' | 'payment' | 'message'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  date: string
  title: string
  description: string
  href: string
}

export function buildPatientTimeline(
  patientId: string,
  data: {
    appointments: Appointment[]
    chartEntries: ChartEntry[]
    images: PatientImage[]
    prescriptions: Prescription[]
    invoices: Invoice[]
    conversations: Conversation[]
  },
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const a of data.appointments.filter((a) => a.patientId === patientId)) {
    events.push({
      id: `apt-${a.id}`,
      type: 'appointment',
      date: a.date,
      title: a.reason,
      description: `Appointment · ${a.status}`,
      href: `/appointments?focus=${a.id}`,
    })
  }

  for (const c of data.chartEntries.filter((c) => c.patientId === patientId)) {
    events.push({
      id: `chart-${c.id}`,
      type: 'chart',
      date: c.date,
      title: c.diagnosis,
      description: `Clinical note · ${c.toothArea}${c.source === 'voice' ? ' · voice-to-chart' : ''}`,
      href: `/patients/${patientId}?tab=chart`,
    })
  }

  for (const img of data.images.filter((i) => i.patientId === patientId)) {
    events.push({
      id: `img-${img.id}`,
      type: 'image',
      date: img.date,
      title: img.toothArea,
      description: `Image added · ${img.category.replace('-', ' ')}`,
      href: `/patients/${patientId}?tab=images`,
    })
  }

  for (const rx of data.prescriptions.filter((r) => r.patientId === patientId)) {
    events.push({
      id: `rx-${rx.id}`,
      type: 'prescription',
      date: rx.date,
      title: 'Prescription issued',
      description: rx.medicines.map((m) => m.name).join(', '),
      href: `/patients/${patientId}?tab=prescriptions`,
    })
  }

  for (const inv of data.invoices.filter((i) => i.patientId === patientId)) {
    events.push({
      id: `inv-${inv.id}`,
      type: 'payment',
      date: inv.date,
      title: `Invoice ${inv.id}`,
      description: `${inv.status} · ${formatCurrency(inv.total)}`,
      href: `/patients/${patientId}?tab=payments`,
    })
  }

  const conversation = data.conversations.find((c) => c.patientId === patientId)
  if (conversation) {
    for (const m of conversation.messages) {
      events.push({
        id: `msg-${m.id}`,
        type: 'message',
        date: m.time,
        title: m.sender === 'clinic' ? 'Message sent' : 'Message received',
        description: m.text,
        href: '/messaging',
      })
    }
  }

  return events.sort((a, b) => b.date.localeCompare(a.date))
}
