import { Link, useNavigate } from 'react-router-dom'
import { History, IndianRupee, Megaphone, Stethoscope, UsersRound, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AiRecommendedActions } from '@/components/shared/ai-recommended-actions'
import { useClinicStore } from '@/state/store'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

export function AdminDashboard() {
  const { patients, doctors, staff, invoices, broadcasts, auditLog } = useClinicStore()
  const navigate = useNavigate()

  const revenue = invoices.reduce((s, i) => s + i.paid, 0)
  const pendingApprovals = broadcasts.filter((b) => b.status === 'pending-approval').length
  const recentActivity = [...auditLog].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6)
  const team = [
    ...doctors.map((d) => ({ id: d.id, name: d.name, title: d.title, href: '/admin/doctors' })),
    ...staff.map((s) => ({
      id: s.id,
      name: s.name,
      title: s.title,
      href: s.role === 'admin' ? '/admin/users' : '/admin/receptionists',
    })),
  ]

  return (
    <div>
      <PageHeader
        title="Clinic overview"
        description={formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Doctors"
          value={doctors.length}
          icon={<Stethoscope className="h-4 w-4" />}
          onClick={() => navigate('/admin/doctors')}
        />
        <StatTile
          label="Staff"
          value={staff.length}
          icon={<UsersRound className="h-4 w-4" />}
          onClick={() => navigate('/admin/users')}
        />
        <StatTile
          label="Patients"
          value={patients.length}
          icon={<Users className="h-4 w-4" />}
          onClick={() => navigate('/patients')}
        />
        <StatTile
          label="Revenue collected"
          value={formatCurrency(revenue)}
          icon={<IndianRupee className="h-4 w-4" />}
          onClick={() => navigate('/reports')}
        />
      </div>

      {pendingApprovals > 0 && (
        <Card className="mt-5 border-warning/30 bg-warning/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Megaphone className="h-4 w-4 text-warning" />
              <span>
                <span className="font-medium">{pendingApprovals}</span> broadcast
                {pendingApprovals > 1 ? 's' : ''} waiting on doctor approval.
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/messaging/broadcasts')}>
              Review
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent activity
              </CardTitle>
              <CardDescription>Latest changes across the clinic system.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/audit-logs">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <EmptyState icon={<History className="h-5 w-5" />} title="No activity yet" className="border-none" />
            ) : (
              <div className="space-y-0.5">
                {recentActivity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-secondary/40">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <div className="min-w-0 flex-1">
                      <p>
                        <span className="font-medium">{entry.actor}</span>{' '}
                        <span className="text-muted-foreground">{entry.action.toLowerCase()}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.target}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(entry.time)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <AiRecommendedActions />

          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>Doctors, receptionists, and admins.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {team.map((member) => (
                <Link
                  key={member.id}
                  to={member.href}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/40"
                >
                  <PatientAvatar id={member.id} name={member.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.title}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
