import { formatCurrency, formatDate } from '@/lib/utils'
import type {
  Appointment,
  Conversation,
  Invoice,
  Patient,
  PrescriptionMedicine,
  Role,
  TreatmentPlan,
} from '@/data/types'

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function firstName(name: string) {
  return name.split(' ')[0]
}

/** Communication Center — draft a reply based on the patient's last message. */
export function suggestReply(conversation: Conversation, patientName: string): string {
  const last = [...conversation.messages].reverse().find((m) => m.sender === 'patient')
  const first = firstName(patientName)
  if (!last) {
    return `Hi ${first}, just checking in — let us know if you have any questions before your visit!`
  }
  const text = last.text.toLowerCase()
  if (text.includes('reschedul') || text.includes('push') || text.includes('move')) {
    return `Hi ${first}, no problem at all — we can move your appointment. Could you share a couple of times that work for you and we'll confirm right away?`
  }
  if (text.includes('pain') || text.includes('hurt') || text.includes('sensitiv') || text.includes('swelling') || text.includes('swell')) {
    return `Hi ${first}, thanks for letting us know. That can be normal in the first day or two, but if it worsens or you notice fever, please call the clinic directly so a doctor can take a look.`
  }
  if (text.includes('confirm') || text.includes('yes')) {
    return `Wonderful, thank you ${first}! You're all set — we'll see you then.`
  }
  if (text.includes('cost') || text.includes('price') || text.includes('bill') || text.includes('pay')) {
    return `Hi ${first}, happy to help with that — I'll share an itemized breakdown shortly. Let us know if you'd like to discuss payment options.`
  }
  return `Hi ${first}, thanks for reaching out! Could you tell us a bit more so we can help right away?`
}

/** Communication Center — 2–3 bullet summary of a conversation. */
export function summarizeConversation(conversation: Conversation, patientName: string): string[] {
  const patientMessages = conversation.messages.filter((m) => m.sender === 'patient')
  const bullets: string[] = []
  bullets.push(
    `${patientName} has exchanged ${conversation.messages.length} message${conversation.messages.length === 1 ? '' : 's'} on ${conversation.channel === 'whatsapp' ? 'WhatsApp' : conversation.channel} — currently ${conversation.status}.`,
  )
  if (patientMessages.length > 0) {
    const last = patientMessages[patientMessages.length - 1]
    bullets.push(`Most recent request: "${last.text.slice(0, 100)}${last.text.length > 100 ? '…' : ''}"`)
  }
  bullets.push(
    conversation.status === 'resolved'
      ? 'No further action needed — thread is closed out.'
      : 'Suggested next step: reply within the next hour to stay inside SLA.',
  )
  return bullets
}

/** Treatment Plans — plain-language summary of progress for a patient. */
export function generateTreatmentSummary(plan: TreatmentPlan, patient: Patient): string {
  const total = plan.stages.reduce((s, st) => s + st.cost, 0)
  const done = plan.stages.filter((s) => s.status === 'completed').length
  const next = plan.stages.find((s) => s.status !== 'completed')
  const first = firstName(patient.name)
  const progressLine = `${first} has completed ${done} of ${plan.stages.length} stages of "${plan.title}", with ${formatCurrency(total)} in total treatment value.`
  const nextLine = next
    ? ` Next up: ${next.label.toLowerCase()}, targeted for ${formatDate(next.targetDate, { day: 'numeric', month: 'short' })}.`
    : ' All stages are complete — plan is ready to be closed out.'
  const riskLine = patient.allergies.length > 0 ? ` Note: patient has recorded allergies (${patient.allergies.join(', ')}) — confirm before prescribing.` : ''
  return progressLine + nextLine + riskLine
}

/** Prescriptions — draft a medicine list from a diagnosis/procedure keyword. */
export function draftPrescription(diagnosis: string): PrescriptionMedicine[] {
  const d = diagnosis.toLowerCase()
  if (d.includes('root canal') || d.includes('pulp') || d.includes('endo')) {
    return [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Thrice daily', duration: '5 days' },
      { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'As needed for pain', duration: '3 days' },
    ]
  }
  if (d.includes('implant') || d.includes('extraction') || d.includes('surg')) {
    return [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Twice daily', duration: '6 days' },
      { name: 'Aceclofenac 100mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '4 days' },
      { name: 'Chlorhexidine mouthwash 0.2%', dosage: '10ml rinse', frequency: 'Twice daily', duration: '10 days' },
    ]
  }
  if (d.includes('gum') || d.includes('periodont') || d.includes('scaling')) {
    return [
      { name: 'Chlorhexidine mouthwash 0.2%', dosage: '10ml rinse', frequency: 'Twice daily', duration: '7 days' },
    ]
  }
  return [
    { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'As needed for pain', duration: '3 days' },
  ]
}

/** Follow-ups — reminder wording for an upcoming appointment. */
export function generateReminderMessage(patientName: string, doctorName: string, date: string, time: string): string {
  const first = firstName(patientName)
  const variants = [
    `Hi ${first}, this is a friendly reminder from Sunrise Dental — your visit with ${doctorName} is on ${formatDate(date, { day: 'numeric', month: 'short' })} at ${time}. Reply YES to confirm.`,
    `Hi ${first}, just a heads-up that you're scheduled with ${doctorName} on ${formatDate(date, { day: 'numeric', month: 'short' })} at ${time}. Let us know if you need to reschedule.`,
  ]
  return pick(variants)
}

/** Timeline / treatment plans — suggest a follow-up message for a patient. */
export function generateFollowUpMessage(patientName: string, planTitle: string, nextStageLabel?: string): string {
  const first = firstName(patientName)
  if (nextStageLabel) {
    return `Hi ${first}, it's time to schedule the next step in your treatment (${nextStageLabel.toLowerCase()}) as part of "${planTitle}". Would you like us to book you in this week?`
  }
  return `Hi ${first}, it's been a while since your last visit for "${planTitle}" — would you like us to schedule a check-up?`
}

/** Booking — recommend the best open slot for a patient. */
export function suggestAppointmentSlot(openSlots: string[]): string | null {
  if (openSlots.length === 0) return null
  const midMorning = openSlots.find((s) => s >= '10:00' && s <= '11:30')
  return midMorning ?? openSlots[0]
}

/** Command palette — canned answers for the Knowledge Assistant. */
export function answerKnowledgeQuestion(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('hour') || q.includes('open') || q.includes('timing')) {
    return 'Sunrise Dental is open Monday–Saturday, 9:00 AM to 7:00 PM. Closed on Sundays and public holidays.'
  }
  if (q.includes('cancel') || q.includes('reschedul')) {
    return 'Patients can reschedule up to 24 hours before their appointment via WhatsApp reply or a phone call — no cancellation fee within that window.'
  }
  if (q.includes('insurance') || q.includes('cashless')) {
    return "We currently accept direct billing for a handful of empanelled insurers — check the patient's invoice notes or ask the front desk to confirm coverage."
  }
  if (q.includes('payment') || q.includes('emi') || q.includes('installment')) {
    return 'Payments can be split across visits and recorded per-invoice from the Billing tab. EMI options are handled outside the system for now.'
  }
  if (q.includes('broadcast') || q.includes('whatsapp campaign')) {
    return 'Broadcasts always need doctor approval before sending — draft one from Messaging → Broadcasts and submit it for review.'
  }
  return "I don't have a specific answer for that yet, but the front desk or your clinic administrator should be able to help — try Clinic Settings or ask in the team chat."
}

/** Patient profile — AI Summary tab. */
export function generatePatientAiSummary(
  patient: Patient,
  ctx: { appointments: Appointment[]; plans: TreatmentPlan[]; invoices: Invoice[] },
) {
  const riskFlags: string[] = []
  if (patient.allergies.length > 0) riskFlags.push(`Allergic to ${patient.allergies.join(', ')}`)
  if (patient.medicalConditions?.length) riskFlags.push(...patient.medicalConditions)
  if (riskFlags.length === 0) riskFlags.push('No known risk factors on file')

  const noShows = ctx.appointments.filter((a) => a.status === 'no-show').length
  const completed = ctx.appointments.filter((a) => a.status === 'completed').length
  const adherence =
    noShows === 0
      ? 'Strong attendance record — no missed visits on file.'
      : `${noShows} missed visit${noShows > 1 ? 's' : ''} out of ${completed + noShows} scheduled — worth a gentle check-in before the next booking.`

  const financial =
    patient.balanceDue > 0
      ? `${formatCurrency(patient.balanceDue)} outstanding against ${formatCurrency(patient.totalBilled)} billed to date.`
      : `Account settled — ${formatCurrency(patient.totalBilled)} billed to date, fully collected.`

  const activePlan = ctx.plans.find((p) => p.status === 'active')
  const nextAction = activePlan
    ? `Continue "${activePlan.title}" — ${activePlan.stages.filter((s) => s.status !== 'completed').length} stage(s) remaining.`
    : patient.balanceDue > 0
      ? 'Follow up on the outstanding balance at the next visit.'
      : 'No urgent action — patient is up to date.'

  return { riskFlags, adherence, financial, nextAction }
}

interface RecommendedAction {
  id: string
  label: string
  description: string
  href: string
}

/** Dashboards — role-specific "AI recommended actions" card. */
export function recommendedActionsFor(
  role: Role,
  ctx: {
    pendingBroadcasts: number
    needingCall: number
    outstandingCount: number
    unconfirmedCount: number
    aiReviewCount: number
  },
): RecommendedAction[] {
  const actions: RecommendedAction[] = []
  if (role === 'doctor') {
    if (ctx.pendingBroadcasts > 0) {
      actions.push({
        id: 'broadcasts',
        label: 'Review pending broadcasts',
        description: `${ctx.pendingBroadcasts} broadcast${ctx.pendingBroadcasts > 1 ? 's are' : ' is'} waiting on your approval.`,
        href: '/messaging/broadcasts',
      })
    }
    if (ctx.aiReviewCount > 0) {
      actions.push({
        id: 'ai-review',
        label: 'Confirm AI-charted entries',
        description: `${ctx.aiReviewCount} voice-to-chart entr${ctx.aiReviewCount > 1 ? 'ies need' : 'y needs'} a quick confirmation.`,
        href: '/ai-charting',
      })
    }
  }
  if (role === 'receptionist') {
    if (ctx.needingCall > 0) {
      actions.push({
        id: 'calls',
        label: 'Call unresponsive patients',
        description: `${ctx.needingCall} patient${ctx.needingCall > 1 ? 's have' : ' has'} not confirmed via WhatsApp.`,
        href: '/messaging/reminders',
      })
    }
    if (ctx.unconfirmedCount > 0) {
      actions.push({
        id: 'confirmations',
        label: 'Chase pending confirmations',
        description: `${ctx.unconfirmedCount} appointment${ctx.unconfirmedCount > 1 ? 's are' : ' is'} awaiting a reply.`,
        href: '/appointments',
      })
    }
  }
  if (role === 'admin') {
    if (ctx.outstandingCount > 0) {
      actions.push({
        id: 'billing',
        label: 'Review outstanding invoices',
        description: `${ctx.outstandingCount} invoice${ctx.outstandingCount > 1 ? 's are' : ' is'} unpaid clinic-wide.`,
        href: '/reports',
      })
    }
    actions.push({
      id: 'analytics',
      label: 'Check this week\'s analytics',
      description: 'Appointment mix and revenue trends were just refreshed.',
      href: '/admin/analytics',
    })
  }
  if (actions.length === 0) {
    actions.push({
      id: 'all-clear',
      label: "You're all caught up",
      description: 'No urgent AI-flagged items right now — nice work.',
      href: '/',
    })
  }
  return actions.slice(0, 3)
}
