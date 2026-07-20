import { CalendarX2 } from 'lucide-react'
import { AppointmentRow } from '@/components/shared/appointment-row'
import { EmptyState } from '@/components/shared/empty-state'
import type { Appointment, Doctor, Patient } from '@/types'

export function DayView({
  appointments,
  patients,
  doctors,
  showDoctor,
  onSelect,
}: {
  appointments: Appointment[]
  patients: Patient[]
  doctors: Doctor[]
  showDoctor: boolean
  onSelect: (id: string) => void
}) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={<CalendarX2 className="h-5 w-5" />}
        title="No appointments this day"
        description="Book a new appointment to fill this slot."
      />
    )
  }

  return (
    <div className="space-y-1">
      {appointments.map((a) => (
        <button key={a.id} onClick={() => onSelect(a.id)} className="w-full text-left">
          <AppointmentRow
            appointment={a}
            patient={patients.find((p) => p.id === a.patientId)}
            doctor={doctors.find((d) => d.id === a.doctorId)}
            showDoctor={showDoctor}
          />
        </button>
      ))}
    </div>
  )
}
