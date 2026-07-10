import { appointments } from './appointments'
import { getPatient } from './patients'
import { getDoctor } from './doctors'
import { invoices } from './invoices'
import { reminders } from './reminders'
import { TODAY_ISO, daysFromToday } from './dates'

export function getTodaysAppointments(doctorId?: string) {
  return appointments
    .filter((a) => a.date === TODAY_ISO && (!doctorId || a.doctorId === doctorId))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function getUpcomingAppointments(days = 7, doctorId?: string) {
  const end = daysFromToday(days)
  return appointments
    .filter(
      (a) =>
        a.date >= TODAY_ISO &&
        a.date <= end &&
        (!doctorId || a.doctorId === doctorId) &&
        a.status !== 'cancelled',
    )
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
}

export function enrichedAppointment(appointmentId: string) {
  const appt = appointments.find((a) => a.id === appointmentId)
  if (!appt) return undefined
  return {
    ...appt,
    patient: getPatient(appt.patientId),
    doctor: getDoctor(appt.doctorId),
  }
}

export function getUnconfirmedFollowUps() {
  return reminders
    .filter((r) => r.status === 'no-response' || r.status === 'rescheduled')
    .map((r) => ({
      reminder: r,
      patient: getPatient(r.patientId),
      appointment: appointments.find((a) => a.id === r.appointmentId),
    }))
}

export function getOutstandingInvoices() {
  return invoices.filter((i) => i.status !== 'paid')
}

export function getTotalOutstanding() {
  return getOutstandingInvoices().reduce((sum, i) => sum + (i.total - i.paid), 0)
}

export function getClinicStats() {
  const todays = getTodaysAppointments()
  return {
    todaysCount: todays.length,
    completedToday: todays.filter((a) => a.status === 'completed').length,
    pendingConfirmations: appointments.filter(
      (a) => a.status === 'pending' && a.date >= TODAY_ISO,
    ).length,
    outstanding: getTotalOutstanding(),
    unconfirmedFollowUps: getUnconfirmedFollowUps().length,
  }
}
