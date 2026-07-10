import { Link } from 'react-router-dom'
import { Clock, Stethoscope } from 'lucide-react'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { AppointmentStatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import type { Appointment, Doctor, Patient } from '@/data/types'
import { cn } from '@/lib/utils'

export function AppointmentRow({
  appointment,
  patient,
  doctor,
  showDoctor = false,
  action,
  className,
}: {
  appointment: Appointment
  patient?: Patient
  doctor?: Doctor
  showDoctor?: boolean
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-transparent px-2 py-2.5 transition-colors hover:border-border hover:bg-secondary/40',
        className,
      )}
    >
      <div className="flex w-16 shrink-0 flex-col items-start">
        <span className="tabular text-sm font-semibold">{appointment.startTime}</span>
        <span className="text-[11px] text-muted-foreground">{appointment.durationMin}m</span>
      </div>

      {patient ? (
        <Link to={`/patients/${patient.id}`} className="shrink-0">
          <PatientAvatar id={patient.id} name={patient.name} />
        </Link>
      ) : (
        <div className="h-9 w-9 shrink-0 rounded-full bg-secondary" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {patient ? (
            <Link to={`/patients/${patient.id}`} className="truncate text-sm font-medium hover:underline">
              {patient.name}
            </Link>
          ) : (
            <span className="truncate text-sm font-medium">Unknown patient</span>
          )}
          {appointment.isFollowUp && (
            <span className="hidden shrink-0 items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground sm:inline-flex">
              <Clock className="h-2.5 w-2.5" />
              Follow-up
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {appointment.reason}
          {showDoctor && doctor && (
            <span className="inline-flex items-center gap-1">
              {' '}
              · <Stethoscope className="h-3 w-3" /> {doctor.name}
            </span>
          )}
        </p>
      </div>

      <AppointmentStatusBadge status={appointment.status} />
      {action}
    </div>
  )
}

export function AppointmentRowButton({ to, label }: { to: string; label: string }) {
  return (
    <Button asChild size="sm" variant="outline" className="ml-1 hidden shrink-0 sm:inline-flex">
      <Link to={to}>{label}</Link>
    </Button>
  )
}
