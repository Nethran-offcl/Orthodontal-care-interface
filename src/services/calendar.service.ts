import { TODAY_ISO, daysFromToday } from '@/lib/date'
import { appointmentsService } from './appointments.service'
import { patientsService } from './patients.service'
import { doctorsService } from './doctors.service'
import { invoicesService } from './invoices.service'
import { remindersService } from './reminders.service'

/**
 * Cross-entity, read-only aggregate queries for the calendar/dashboard surfaces.
 * Composes the other services rather than reaching into raw data.
 */
export const calendarService = {
  async getTodaysAppointments(doctorId?: string) {
    const appointments = await appointmentsService.getAll()
    return appointments
      .filter((a) => a.date === TODAY_ISO && (!doctorId || a.doctorId === doctorId))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  },

  async getUpcomingAppointments(days = 7, doctorId?: string) {
    const end = daysFromToday(days)
    const appointments = await appointmentsService.getAll()
    return appointments
      .filter(
        (a) =>
          a.date >= TODAY_ISO &&
          a.date <= end &&
          (!doctorId || a.doctorId === doctorId) &&
          a.status !== 'cancelled',
      )
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  },

  async getEnrichedAppointment(appointmentId: string) {
    const appointment = await appointmentsService.getById(appointmentId)
    if (!appointment) return undefined
    const [patient, doctor] = await Promise.all([
      patientsService.getById(appointment.patientId),
      doctorsService.getById(appointment.doctorId),
    ])
    return { ...appointment, patient, doctor }
  },

  async getUnconfirmedFollowUps() {
    const [reminders, appointments] = await Promise.all([
      remindersService.getUnconfirmed(),
      appointmentsService.getAll(),
    ])
    return Promise.all(
      reminders.map(async (reminder) => ({
        reminder,
        patient: await patientsService.getById(reminder.patientId),
        appointment: appointments.find((a) => a.id === reminder.appointmentId),
      })),
    )
  },

  async getClinicStats() {
    const [todays, appointments, outstanding, unconfirmedFollowUps] = await Promise.all([
      calendarService.getTodaysAppointments(),
      appointmentsService.getAll(),
      invoicesService.getTotalOutstanding(),
      calendarService.getUnconfirmedFollowUps(),
    ])
    return {
      todaysCount: todays.length,
      completedToday: todays.filter((a) => a.status === 'completed').length,
      pendingConfirmations: appointments.filter((a) => a.status === 'pending' && a.date >= TODAY_ISO).length,
      outstanding,
      unconfirmedFollowUps: unconfirmedFollowUps.length,
    }
  },
}
