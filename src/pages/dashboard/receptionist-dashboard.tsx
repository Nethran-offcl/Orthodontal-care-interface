import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, CalendarDays, IndianRupee, MessageSquareWarning, PhoneCall, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { AppointmentRow, AppointmentRowButton } from '@/components/shared/appointment-row'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AiRecommendedActions } from '@/components/shared/ai-recommended-actions'
import { useClinicStore } from '@/state/store'
import { TODAY_ISO } from '@/lib/date'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

export function ReceptionistDashboard() {
  const { appointments, patients, doctors, invoices, reminders } = useClinicStore()
  const navigate = useNavigate()

  const todays = appointments
    .filter((a) => a.date === TODAY_ISO)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((a) => ({
      ...a,
      patient: patients.find((p) => p.id === a.patientId),
      doctor: doctors.find((d) => d.id === a.doctorId),
    }))

  const needingCall = reminders
    .filter((r) => r.status === 'no-response' || r.status === 'rescheduled')
    .map((r) => ({ reminder: r, patient: patients.find((p) => p.id === r.patientId) }))

  const outstanding = invoices.filter((i) => i.status !== 'paid')
  const totalOutstanding = outstanding.reduce((sum, i) => sum + (i.total - i.paid), 0)
  const pendingConfirm = appointments.filter((a) => a.status === 'pending').length

  return (
    <div>
      <PageHeader
        title="Receptionist"
        description={formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/patients?new=1')}>
              <UserPlus className="h-4 w-4" />
              New patient
            </Button>
            <Button onClick={() => navigate('/appointments?new=1')}>
              <CalendarDays className="h-4 w-4" />
              Book appointment
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Today's appointments" value={todays.length} icon={<CalendarDays className="h-4 w-4" />} />
        <StatTile
          label="Pending confirmation"
          value={pendingConfirm}
          icon={<MessageSquareWarning className="h-4 w-4" />}
          trend={pendingConfirm > 0 ? 'Awaiting patient reply' : undefined}
          trendTone={pendingConfirm > 0 ? 'negative' : 'neutral'}
        />
        <StatTile
          label="Need a call today"
          value={needingCall.length}
          icon={<PhoneCall className="h-4 w-4" />}
          trend={needingCall.length > 0 ? 'No WhatsApp response' : undefined}
          trendTone={needingCall.length > 0 ? 'negative' : 'neutral'}
          onClick={() => navigate('/messaging/reminders')}
        />
        <StatTile
          label="Payments due"
          value={formatCurrency(totalOutstanding)}
          icon={<IndianRupee className="h-4 w-4" />}
          onClick={() => navigate('/billing')}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Today's schedule</CardTitle>
              <CardDescription>Across Dr. Rao and Dr. Menon.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/appointments">View calendar</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {todays.length === 0 ? (
              <EmptyState
                icon={<CalendarDays className="h-5 w-5" />}
                title="Nothing on the calendar today"
                description="Book a new appointment to get started."
              />
            ) : (
              todays.map((a) => (
                <AppointmentRow
                  key={a.id}
                  appointment={a}
                  patient={a.patient}
                  doctor={a.doctor}
                  showDoctor
                  action={<AppointmentRowButton to={`/patients/${a.patientId}`} label="View" />}
                />
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <AiRecommendedActions />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Needs a phone call
            </CardTitle>
            <CardDescription>Auto-generated from unconfirmed follow-up reminders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {needingCall.length === 0 ? (
              <EmptyState
                icon={<PhoneCall className="h-5 w-5" />}
                title="Nothing to chase"
                description="Every follow-up reminder has a response."
                className="border-none py-8"
              />
            ) : (
              needingCall.map(({ reminder, patient }) => (
                <Link
                  key={reminder.id}
                  to={`/patients/${reminder.patientId}`}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm transition-colors hover:bg-destructive/10',
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{patient?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Due {formatDate(reminder.dueDate, { day: 'numeric', month: 'short' })} ·{' '}
                      {reminder.status === 'rescheduled' ? 'asked to reschedule' : 'no response yet'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0">
                    Open
                  </Button>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
