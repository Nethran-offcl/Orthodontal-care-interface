import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertTriangle, CalendarClock, ClipboardList, PhoneCall, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReminderStatusBadge } from '@/components/shared/status-badge'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { useClinicStore } from '@/state/store'
import { getDoctor, getTreatmentPlan } from '@/data'
import { formatDate } from '@/lib/utils'

export function ReminderQueuePage() {
  const { reminders, patients, appointments, sendMessage, updateReminderStatus } = useClinicStore()
  const navigate = useNavigate()

  const sorted = [...reminders].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const needingCall = sorted.filter((r) => r.status === 'no-response' || r.status === 'rescheduled')
  const rest = sorted.filter((r) => r.status !== 'no-response' && r.status !== 'rescheduled')

  function sendReminderNow(id: string, patientId: string, appointmentId: string) {
    const patient = patients.find((p) => p.id === patientId)
    const appt = appointments.find((a) => a.id === appointmentId)
    const doctor = appt ? getDoctor(appt.doctorId) : undefined
    if (!patient || !appt) return
    sendMessage(
      patientId,
      `Hi ${patient.name.split(' ')[0]}, this is a reminder from Sunrise Dental that your follow-up visit with ${doctor?.name} is scheduled for ${formatDate(appt.date, { day: 'numeric', month: 'short' })} at ${appt.startTime}. Please reply YES to confirm or call us to reschedule.`,
    )
    updateReminderStatus(id, 'sent')
    toast.success('Reminder sent via WhatsApp')
  }

  return (
    <div className="space-y-6">
      {needingCall.length > 0 && (
        <Card className="border-destructive/25 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Needs a phone call
            </CardTitle>
            <CardDescription>No WhatsApp confirmation received — call before the appointment date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {needingCall.map((r) => {
              const patient = patients.find((p) => p.id === r.patientId)
              const appt = appointments.find((a) => a.id === r.appointmentId)
              const plan = r.treatmentPlanId ? getTreatmentPlan(r.treatmentPlanId) : undefined
              if (!patient) return null
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <PatientAvatar id={patient.id} name={patient.name} />
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {formatDate(r.dueDate, { day: 'numeric', month: 'short' })}
                        {appt ? ` · ${appt.reason}` : ''}
                      </p>
                      {plan && (
                        <p className="text-[11px] text-muted-foreground">
                          From treatment plan: <span className="font-medium">{plan.title}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReminderStatusBadge status={r.status} />
                    <Button size="sm" variant="outline" onClick={() => navigate(`/patients/${patient.id}`)}>
                      <PhoneCall className="h-3.5 w-3.5" />
                      Call &amp; open profile
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Reminder queue
          </CardTitle>
          <CardDescription>Auto-generated from treatment plans and upcoming appointments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {rest.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="No reminders in the queue" className="border-none" />
          ) : (
            rest.map((r) => {
              const patient = patients.find((p) => p.id === r.patientId)
              const appt = appointments.find((a) => a.id === r.appointmentId)
              const plan = r.treatmentPlanId ? getTreatmentPlan(r.treatmentPlanId) : undefined
              if (!patient) return null
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <PatientAvatar id={patient.id} name={patient.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {formatDate(r.dueDate, { day: 'numeric', month: 'short' })}
                        {appt ? ` · ${appt.reason}` : ''}
                      </p>
                      {plan && (
                        <p className="text-[11px] text-muted-foreground">
                          From treatment plan: <span className="font-medium">{plan.title}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReminderStatusBadge status={r.status} />
                    {r.status === 'scheduled' && appt && (
                      <Button size="sm" variant="outline" onClick={() => sendReminderNow(r.id, r.patientId, r.appointmentId)}>
                        <Send className="h-3.5 w-3.5" />
                        Send now
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
