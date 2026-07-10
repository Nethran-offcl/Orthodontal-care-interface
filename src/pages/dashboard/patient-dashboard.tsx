import { useNavigate } from 'react-router-dom'
import { CalendarClock, CheckCircle2, IndianRupee, MessageCircle, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StageStatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { getDoctor } from '@/data'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

export function PatientDashboard() {
  const { currentPatientId } = useAppState()
  const { patients, appointments, treatmentPlans, invoices } = useClinicStore()
  const navigate = useNavigate()

  const patient = patients.find((p) => p.id === currentPatientId)
  const myAppointments = appointments
    .filter((a) => a.patientId === currentPatientId)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  const upcoming = myAppointments.find(
    (a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'checked-in',
  )
  const upcomingDoctor = upcoming ? getDoctor(upcoming.doctorId) : undefined

  const activePlan = treatmentPlans.find((t) => t.patientId === currentPatientId && t.status === 'active')
  const completedStages = activePlan?.stages.filter((s) => s.status === 'completed').length ?? 0
  const totalStages = activePlan?.stages.length ?? 0
  const progressPct = totalStages ? Math.round((completedStages / totalStages) * 100) : 0

  const myInvoices = invoices.filter((i) => i.patientId === currentPatientId)
  const due = myInvoices.reduce((sum, i) => sum + (i.total - i.paid), 0)

  if (!patient) return null

  return (
    <div>
      <PageHeader
        title={`Hi ${patient.name.split(' ')[0]} 👋`}
        description="Here's what's coming up with your care at Sunrise Dental."
        actions={
          <Button onClick={() => navigate('/messaging')}>
            <MessageCircle className="h-4 w-4" />
            Message the clinic
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Your next visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold">{formatDate(upcoming.date, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p className="text-sm text-muted-foreground">
                    {upcoming.startTime} · {upcoming.reason} · {upcomingDoctor?.name}
                  </p>
                  <span
                    className={cn(
                      'mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                      upcoming.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success',
                    )}
                  >
                    {upcoming.status === 'pending'
                      ? 'Awaiting your confirmation'
                      : upcoming.status === 'checked-in'
                        ? "You're checked in"
                        : 'Confirmed'}
                  </span>
                </div>
                <Button variant="outline" onClick={() => navigate('/messaging')}>
                  Reschedule via WhatsApp
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={<CalendarClock className="h-5 w-5" />}
                title="No upcoming visit scheduled"
                description="We'll send you a WhatsApp reminder as soon as your next visit is booked."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold tabular">{formatCurrency(due)}</p>
            <p className="text-xs text-muted-foreground">
              {due > 0 ? 'Outstanding across your visits' : 'You are all settled up'}
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/billing')}>
              View my bills
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {activePlan ? activePlan.title : 'Treatment plan'}
          </CardTitle>
          <CardDescription>
            {activePlan
              ? `${completedStages} of ${totalStages} stages complete`
              : 'No active treatment plan right now.'}
          </CardDescription>
        </CardHeader>
        {activePlan && (
          <CardContent className="space-y-4">
            <Progress value={progressPct} />
            <div className="space-y-2">
              {activePlan.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border-2 border-border" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{stage.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(stage.targetDate, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <StageStatusBadge status={stage.status} />
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
