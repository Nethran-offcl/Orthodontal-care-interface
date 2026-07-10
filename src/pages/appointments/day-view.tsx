import { CalendarX2 } from 'lucide-react'
import { AppointmentRow } from '@/components/shared/appointment-row'
import { EmptyState } from '@/components/shared/empty-state'
import { getDoctor } from '@/data'
import type { Appointment, Patient } from '@/data/types'

export function DayView({
  appointments,
  patients,
  showDoctor,
  onSelect,
}: {
  appointments: Appointment[]
  patients: Patient[]
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
            doctor={getDoctor(a.doctorId)}
            showDoctor={showDoctor}
          />
        </button>
      ))}
    </div>
  )
}
