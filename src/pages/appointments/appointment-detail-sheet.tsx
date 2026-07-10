import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Mic,
  Phone,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { AppointmentStatusBadge } from '@/components/shared/status-badge'
import { useClinicStore } from '@/state/store'
import { getDoctor } from '@/data'
import { formatCurrency, formatDate } from '@/lib/utils'

export function AppointmentDetailSheet({
  appointmentId,
  onOpenChange,
}: {
  appointmentId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const { appointments, patients, invoices, updateAppointmentStatus, rescheduleAppointment, sendMessage } =
    useClinicStore()
  const navigate = useNavigate()
  const [rescheduling, setRescheduling] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const appointment = appointments.find((a) => a.id === appointmentId)
  const patient = appointment ? patients.find((p) => p.id === appointment.patientId) : undefined
  const doctor = appointment ? getDoctor(appointment.doctorId) : undefined
  const outstanding = patient
    ? invoices.filter((i) => i.patientId === patient.id).reduce((s, i) => s + (i.total - i.paid), 0)
    : 0

  useEffect(() => {
    if (appointment) {
      setDate(appointment.date)
      setTime(appointment.startTime)
      setRescheduling(false)
    }
  }, [appointment])

  if (!appointment || !patient) {
    return (
      <Sheet open={!!appointmentId} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    )
  }

  const canStart = appointment.status === 'confirmed' || appointment.status === 'checked-in'
  const isOpenEnded = appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no-show'

  function saveReschedule() {
    rescheduleAppointment(appointment!.id, date, time)
    sendMessage(
      patient!.id,
      `No problem, ${patient!.name.split(' ')[0]}. Your appointment has been moved to ${date} at ${time}. See you then!`,
    )
    toast.success('Appointment rescheduled', { description: 'A WhatsApp update was sent to the patient.' })
    setRescheduling(false)
  }

  return (
    <Sheet open={!!appointmentId} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 scrollbar-thin sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle>Appointment details</SheetTitle>
          <SheetDescription>{appointment.id}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 px-5 pb-6">
          <div className="flex items-center gap-3">
            <PatientAvatar id={patient.id} name={patient.name} size="lg" />
            <div className="min-w-0 flex-1">
              <button
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="truncate text-base font-semibold hover:underline"
              >
                {patient.name}
              </button>
              <p className="text-xs text-muted-foreground">
                {patient.id} · {patient.age} yrs · {patient.phone}
              </p>
            </div>
            <AppointmentStatusBadge status={appointment.status} />
          </div>

          {outstanding > 0 && (
            <div className="rounded-md bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
              {formatCurrency(outstanding)} outstanding on this patient's account
            </div>
          )}

          <Separator />

          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Doctor</dt>
            <dd className="text-right font-medium">{doctor?.name}</dd>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-right font-medium">{formatDate(appointment.date, { weekday: 'short', day: 'numeric', month: 'short' })}</dd>
            <dt className="text-muted-foreground">Time</dt>
            <dd className="text-right font-medium">
              {appointment.startTime} · {appointment.durationMin} min
            </dd>
            <dt className="text-muted-foreground">Reason</dt>
            <dd className="text-right font-medium">{appointment.reason}</dd>
            <dt className="text-muted-foreground">Type</dt>
            <dd className="text-right font-medium">{appointment.isFollowUp ? 'Follow-up' : 'New visit'}</dd>
          </dl>

          {rescheduling ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="r-date">New date</Label>
                  <Input id="r-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-time">New time</Label>
                  <Input id="r-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setRescheduling(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveReschedule}>
                  Save &amp; notify patient
                </Button>
              </div>
            </div>
          ) : (
            <Separator />
          )}

          <div className="space-y-2">
            {canStart && (
              <Button className="w-full" onClick={() => navigate(`/consultation/${appointment.id}`)}>
                <Mic className="h-4 w-4" />
                Start consultation
              </Button>
            )}

            {appointment.status === 'pending' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  updateAppointmentStatus(appointment.id, 'confirmed')
                  toast.success('Marked as confirmed')
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as confirmed
              </Button>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  updateAppointmentStatus(appointment.id, 'checked-in')
                  toast.success('Patient checked in')
                }}
              >
                <UserRound className="h-4 w-4" />
                Check in patient
              </Button>
            )}

            {isOpenEnded && !rescheduling && (
              <Button variant="outline" className="w-full" onClick={() => setRescheduling(true)}>
                <CalendarClock className="h-4 w-4" />
                Reschedule
              </Button>
            )}

            <Button variant="outline" className="w-full" onClick={() => navigate(`/patients/${patient.id}`)}>
              <ClipboardList className="h-4 w-4" />
              View patient profile
            </Button>

            {isOpenEnded && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => {
                    updateAppointmentStatus(appointment.id, 'no-show')
                    toast('Marked as no-show', { description: 'Consider a follow-up call.' })
                  }}
                >
                  <Phone className="h-4 w-4" />
                  No-show
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    updateAppointmentStatus(appointment.id, 'cancelled')
                    toast('Appointment cancelled')
                  }}
                >
                  <Ban className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}

            {!isOpenEnded && (
              <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
                {appointment.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                This appointment is {appointment.status.replace('-', ' ')}.
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
