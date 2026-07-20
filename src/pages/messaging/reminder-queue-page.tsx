import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertTriangle, CalendarClock, ClipboardList, PhoneCall, Send, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ReminderStatusBadge } from '@/components/shared/status-badge'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { useClinicStore } from '@/state/store'
import { aiService, treatmentPlansService } from '@/services'
import { formatDate } from '@/lib/utils'
import type { TreatmentPlan } from '@/types'

export function ReminderQueuePage() {
  const { reminders, patients, appointments, doctors, sendMessage, updateReminderStatus } = useClinicStore()
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [plansById, setPlansById] = useState<Record<string, TreatmentPlan>>({})

  const sorted = [...reminders].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const needingCall = sorted.filter((r) => r.status === 'no-response' || r.status === 'rescheduled')
  const rest = sorted.filter((r) => r.status !== 'no-response' && r.status !== 'rescheduled')

  useEffect(() => {
    let alive = true
    const ids = [...new Set(reminders.map((r) => r.treatmentPlanId).filter((id): id is string => !!id))]
    Promise.all(ids.map((id) => treatmentPlansService.getById(id))).then((plans) => {
      if (!alive) return
      const next: Record<string, TreatmentPlan> = {}
      plans.forEach((p) => {
        if (p) next[p.id] = p
      })
      setPlansById(next)
    })
    return () => {
      alive = false
    }
  }, [reminders])

  function getTreatmentPlan(id: string) {
    return plansById[id]
  }

  function defaultMessage(patientId: string, appointmentId: string) {
    const patient = patients.find((p) => p.id === patientId)
    const appt = appointments.find((a) => a.id === appointmentId)
    const doctor = appt ? doctors.find((d) => d.id === appt.doctorId) : undefined
    if (!patient || !appt || !doctor) return ''
    return `Hi ${patient.name.split(' ')[0]}, this is a reminder from Sunrise Dental that your follow-up visit with ${doctor.name} is scheduled for ${formatDate(appt.date, { day: 'numeric', month: 'short' })} at ${appt.startTime}. Please reply YES to confirm or call us to reschedule.`
  }

  async function generateWording(id: string, patientId: string, appointmentId: string) {
    const patient = patients.find((p) => p.id === patientId)
    const appt = appointments.find((a) => a.id === appointmentId)
    const doctor = appt ? doctors.find((d) => d.id === appt.doctorId) : undefined
    if (!patient || !appt || !doctor) return
    const text = await aiService.generateReminderMessage(patient.name, doctor.name, appt.date, appt.startTime)
    setDrafts((d) => ({ ...d, [id]: text }))
  }

  function sendReminderNow(id: string, patientId: string, appointmentId: string) {
    const text = drafts[id] || defaultMessage(patientId, appointmentId)
    if (!text) return
    sendMessage(patientId, text)
    updateReminderStatus(id, 'sent')
    toast.success('Reminder sent via WhatsApp')
    setDrafts((d) => {
      const next = { ...d }
      delete next[id]
      return next
    })
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
                      <>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => generateWording(r.id, r.patientId, r.appointmentId)}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              AI wording
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                              <Sparkles className="h-3 w-3" /> Suggested message
                            </p>
                            <p className="text-xs leading-relaxed text-foreground">
                              {drafts[r.id] ?? 'Click again to regenerate.'}
                            </p>
                          </PopoverContent>
                        </Popover>
                        <Button size="sm" variant="outline" onClick={() => sendReminderNow(r.id, r.patientId, r.appointmentId)}>
                          <Send className="h-3.5 w-3.5" />
                          Send now
                        </Button>
                      </>
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
