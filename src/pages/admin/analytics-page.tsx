import { useMemo } from 'react'
import { CalendarDays, ClipboardList, Receipt, Users2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { BarList } from '@/components/shared/bar-list'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useClinicStore } from '@/state/store'
import { formatCurrency } from '@/lib/utils'

const appointmentStatusLabels: Record<string, { label: string; tone: string }> = {
  confirmed: { label: 'Confirmed', tone: 'bg-primary' },
  pending: { label: 'Pending', tone: 'bg-warning' },
  'checked-in': { label: 'Checked in', tone: 'bg-accent-foreground/60' },
  completed: { label: 'Completed', tone: 'bg-success' },
  cancelled: { label: 'Cancelled', tone: 'bg-muted-foreground/40' },
  'no-show': { label: 'No-show', tone: 'bg-destructive' },
}

const stageLabels: Record<string, { label: string; tone: string }> = {
  planned: { label: 'Planned', tone: 'bg-muted-foreground/40' },
  'in-progress': { label: 'In progress', tone: 'bg-warning' },
  completed: { label: 'Completed', tone: 'bg-success' },
}

const invoiceLabels: Record<string, { label: string; tone: string }> = {
  paid: { label: 'Paid', tone: 'bg-success' },
  partial: { label: 'Partially paid', tone: 'bg-warning' },
  pending: { label: 'Pending', tone: 'bg-destructive' },
}

export function AdminAnalyticsPage() {
  const { appointments, treatmentPlans, invoices, patients } = useClinicStore()

  const appointmentMix = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of appointments) counts[a.status] = (counts[a.status] ?? 0) + 1
    return Object.entries(counts).map(([status, value]) => ({
      label: appointmentStatusLabels[status]?.label ?? status,
      value,
      toneClass: appointmentStatusLabels[status]?.tone,
    }))
  }, [appointments])

  const stageMix = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of treatmentPlans) for (const s of t.stages) counts[s.status] = (counts[s.status] ?? 0) + 1
    return Object.entries(counts).map(([status, value]) => ({
      label: stageLabels[status]?.label ?? status,
      value,
      toneClass: stageLabels[status]?.tone,
    }))
  }, [treatmentPlans])

  const invoiceMix = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const i of invoices) counts[i.status] = (counts[i.status] ?? 0) + 1
    return Object.entries(counts).map(([status, value]) => ({
      label: invoiceLabels[status]?.label ?? status,
      value,
      toneClass: invoiceLabels[status]?.tone,
    }))
  }, [invoices])

  const planValue = treatmentPlans.reduce((s, t) => s + t.stages.reduce((ss, st) => ss + st.cost, 0), 0)
  const avgInvoice = invoices.length ? invoices.reduce((s, i) => s + i.total, 0) / invoices.length : 0

  return (
    <div>
      <PageHeader title="Analytics" description="Clinic-wide cuts across appointments, treatment, and billing." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total appointments" value={appointments.length} icon={<CalendarDays className="h-4 w-4" />} />
        <StatTile label="Patients on record" value={patients.length} icon={<Users2 className="h-4 w-4" />} />
        <StatTile label="Treatment value" value={formatCurrency(planValue)} icon={<ClipboardList className="h-4 w-4" />} />
        <StatTile label="Avg. invoice" value={formatCurrency(Math.round(avgInvoice))} icon={<Receipt className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Appointment status mix</CardTitle>
            <CardDescription>Every appointment in the system, by current status.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={appointmentMix} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treatment stage distribution</CardTitle>
            <CardDescription>Stages across every treatment plan, by status.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={stageMix} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice status mix</CardTitle>
            <CardDescription>How much of billed revenue is actually collected.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={invoiceMix} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
