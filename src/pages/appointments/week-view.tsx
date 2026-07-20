import { isToday, isSameDay, format } from 'date-fns'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { cn } from '@/lib/utils'
import type { Appointment, Patient } from '@/types'

export function WeekView({
  weekDays,
  appointments,
  patients,
  selectedDate,
  onSelectDay,
  onSelectAppointment,
}: {
  weekDays: Date[]
  appointments: Appointment[]
  patients: Patient[]
  selectedDate: Date
  onSelectDay: (d: Date) => void
  onSelectAppointment: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const iso = format(day, 'yyyy-MM-dd')
        const dayAppts = appointments
          .filter((a) => a.date === iso)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))

        return (
          <div key={iso} className="min-w-0">
            <button
              onClick={() => onSelectDay(day)}
              className={cn(
                'mb-2 flex w-full flex-col items-center rounded-md py-1.5 transition-colors',
                isSameDay(day, selectedDate) ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary',
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                {format(day, 'EEE')}
              </span>
              <span className={cn('text-sm font-semibold', isToday(day) && !isSameDay(day, selectedDate) && 'text-primary')}>
                {format(day, 'd')}
              </span>
            </button>

            <div className="flex flex-col gap-1.5">
              {dayAppts.length === 0 ? (
                <div className="rounded-md border border-dashed border-border py-4 text-center text-[11px] text-muted-foreground">
                  —
                </div>
              ) : (
                dayAppts.map((a) => {
                  const patient = patients.find((p) => p.id === a.patientId)
                  return (
                    <button
                      key={a.id}
                      onClick={() => onSelectAppointment(a.id)}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-1.5 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-secondary/60"
                    >
                      {patient && <PatientAvatar id={patient.id} name={patient.name} size="sm" className="shrink-0" />}
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium leading-tight">{patient?.name}</p>
                        <p className="truncate text-[10px] leading-tight text-muted-foreground">{a.startTime}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
