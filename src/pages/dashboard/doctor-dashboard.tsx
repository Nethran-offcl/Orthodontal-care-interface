import { Link, useNavigate } from 'react-router-dom'
import { CalendarCheck2, ClipboardList, Megaphone, Mic, Users2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { AppointmentRow, AppointmentRowButton } from '@/components/shared/appointment-row'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AiRecommendedActions } from '@/components/shared/ai-recommended-actions'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { TODAY_ISO } from '@/lib/date'
import { formatDate } from '@/lib/utils'

export function DoctorDashboard() {
  const { userId } = useAuth()
  const currentDoctorId = userId ?? ''
  const { appointments, patients, doctors, broadcasts, treatmentPlans } = useClinicStore()
  const navigate = useNavigate()
  const doctor = doctors.find((d) => d.id === currentDoctorId)

  const todays = appointments
    .filter((a) => a.date === TODAY_ISO && a.doctorId === currentDoctorId)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((a) => ({ ...a, patient: patients.find((p) => p.id === a.patientId) }))

  const nextUp = todays.find((a) => a.status === 'confirmed' || a.status === 'checked-in')
  const completedCount = todays.filter((a) => a.status === 'completed').length
  const pendingApprovals = broadcasts.filter((b) => b.status === 'pending-approval').length
  const activePlans = treatmentPlans.filter(
    (t) => t.createdByDoctorId === currentDoctorId && t.status === 'active',
  ).length
  const recentPatients = [...patients]
    .sort((a, b) => b.registeredOn.localeCompare(a.registeredOn))
    .slice(0, 4)

  return (
    <div>
      <PageHeader
        title={`Good to see you, ${doctor?.name.replace('Dr. ', '') ?? 'Doctor'}`}
        description={formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={
          nextUp ? (
            <Button onClick={() => navigate(`/consultation/${nextUp.id}`)}>
              <Mic className="h-4 w-4" />
              Start next consultation
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Today's patients" value={todays.length} icon={<Users2 className="h-4 w-4" />} />
        <StatTile
          label="Completed"
          value={`${completedCount} / ${todays.length}`}
          icon={<CalendarCheck2 className="h-4 w-4" />}
        />
        <StatTile
          label="Broadcasts to review"
          value={pendingApprovals}
          icon={<Megaphone className="h-4 w-4" />}
          trend={pendingApprovals > 0 ? 'Needs your approval' : undefined}
          trendTone={pendingApprovals > 0 ? 'negative' : 'neutral'}
          onClick={() => navigate('/messaging/broadcasts')}
        />
        <StatTile
          label="Active treatment plans"
          value={activePlans}
          icon={<ClipboardList className="h-4 w-4" />}
          className="hidden sm:block"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Today's schedule</CardTitle>
              <CardDescription>Full patient context loads before each visit.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/appointments">View calendar</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {todays.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck2 className="h-5 w-5" />}
                title="No appointments today"
                description="Enjoy the quiet — or check tomorrow's schedule."
              />
            ) : (
              todays.map((a) => (
                <AppointmentRow
                  key={a.id}
                  appointment={a}
                  patient={a.patient}
                  action={
                    a.status !== 'completed' && a.status !== 'cancelled' && a.status !== 'no-show' ? (
                      <AppointmentRowButton to={`/consultation/${a.id}`} label="Open" />
                    ) : (
                      <AppointmentRowButton to={`/patients/${a.patientId}`} label="View" />
                    )
                  }
                />
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <AiRecommendedActions />

          <Card>
            <CardHeader>
              <CardTitle>Recently registered</CardTitle>
              <CardDescription>New patients from the front desk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentPatients.map((p) => (
                <Link
                  key={p.id}
                  to={`/patients/${p.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-secondary"
                >
                  <span className="truncate">{p.name}</span>
                  <Badge variant="secondary" className="shrink-0">
                    {p.id}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          {pendingApprovals > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Megaphone className="h-4 w-4" />
                  Broadcast awaiting approval
                </CardTitle>
                <CardDescription>
                  A message is ready to send but needs your review before it reaches patients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/messaging/broadcasts')}>
                  Review broadcast
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
