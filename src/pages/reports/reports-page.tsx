import { useMemo } from 'react'
import { CalendarCheck2, IndianRupee, MessagesSquare, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { BarList } from '@/components/shared/bar-list'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useClinicStore } from '@/state/store'
import { doctors } from '@/data'
import { formatCurrency } from '@/lib/utils'

export function ReportsPage() {
  const { appointments, invoices, reminders, broadcasts, patients } = useClinicStore()

  const revenue = useMemo(() => invoices.reduce((s, i) => s + i.paid, 0), [invoices])
  const outstanding = useMemo(() => invoices.reduce((s, i) => s + (i.total - i.paid), 0), [invoices])

  const reminderBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of reminders) counts[r.status] = (counts[r.status] ?? 0) + 1
    const labels: Record<string, { label: string; tone: string }> = {
      confirmed: { label: 'Confirmed', tone: 'bg-success' },
      sent: { label: 'Sent — awaiting reply', tone: 'bg-primary' },
      scheduled: { label: 'Scheduled', tone: 'bg-muted-foreground/40' },
      rescheduled: { label: 'Reschedule requested', tone: 'bg-warning' },
      'no-response': { label: 'No response', tone: 'bg-destructive' },
    }
    return Object.entries(counts).map(([status, value]) => ({
      label: labels[status]?.label ?? status,
      value,
      toneClass: labels[status]?.tone,
    }))
  }, [reminders])

  const confirmedRate = useMemo(() => {
    const total = reminders.length || 1
    const confirmed = reminders.filter((r) => r.status === 'confirmed').length
    return Math.round((confirmed / total) * 100)
  }, [reminders])

  const doctorPerformance = useMemo(
    () =>
      doctors.map((d) => {
        const completed = appointments.filter((a) => a.doctorId === d.id && a.status === 'completed').length
        const patientIds = new Set(
          patients.filter((p) => p.primaryDoctorId === d.id).map((p) => p.id),
        )
        const doctorRevenue = invoices
          .filter((i) => patientIds.has(i.patientId))
          .reduce((s, i) => s + i.paid, 0)
        return { label: d.name, value: doctorRevenue, completed }
      }),
    [appointments, invoices, patients],
  )

  const leadSourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of patients) counts[p.leadSource] = (counts[p.leadSource] ?? 0) + 1
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [patients])

  const recentBroadcasts = useMemo(
    () => broadcasts.filter((b) => b.status === 'sent').sort((a, b) => (b.sentAt ?? '').localeCompare(a.sentAt ?? '')),
    [broadcasts],
  )

  return (
    <div>
      <PageHeader title="Reports" description="Follow-up compliance, revenue, and message performance." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Revenue collected" value={formatCurrency(revenue)} icon={<IndianRupee className="h-4 w-4" />} />
        <StatTile label="Outstanding" value={formatCurrency(outstanding)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatTile
          label="Follow-up confirmation rate"
          value={`${confirmedRate}%`}
          icon={<CalendarCheck2 className="h-4 w-4" />}
        />
        <StatTile label="Active conversations" value={patients.length} icon={<MessagesSquare className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Follow-up compliance</CardTitle>
            <CardDescription>Where every reminder in the system currently stands.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={reminderBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by doctor</CardTitle>
            <CardDescription>Collected payments from each doctor's patients.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={doctorPerformance} formatValue={(v) => formatCurrency(v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient acquisition</CardTitle>
            <CardDescription>Where patients are coming from.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={leadSourceBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Broadcast performance</CardTitle>
            <CardDescription>Delivery and read rates for sent campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBroadcasts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No broadcasts sent yet.</p>
            ) : (
              recentBroadcasts.map((bc) => {
                const deliveredPct = bc.deliveredCount ? Math.round((bc.deliveredCount / bc.audienceCount) * 100) : 0
                const readPct = bc.readCount && bc.deliveredCount ? Math.round((bc.readCount / bc.deliveredCount) * 100) : 0
                return (
                  <div key={bc.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{bc.title}</span>
                      <span className="text-muted-foreground">
                        {bc.deliveredCount}/{bc.audienceCount} delivered · {readPct}% read
                      </span>
                    </div>
                    <Progress value={deliveredPct} />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
