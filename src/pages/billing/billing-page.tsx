import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IndianRupee, Receipt, TrendingUp, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { ExpandableCard } from '@/components/shared/expandable-card'
import { InvoiceStatusBadge } from '@/components/shared/status-badge'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RecordPaymentDialog } from '@/pages/patients/record-payment-dialog'
import { useClinicStore } from '@/state/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/data/types'

export function BillingPage() {
  const { invoices, patients } = useClinicStore()
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null)

  const totalBilled = invoices.reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0)
  const totalDue = totalBilled - totalPaid
  const outstanding = invoices.filter((i) => i.status !== 'paid').sort((a, b) => b.date.localeCompare(a.date))
  const all = [...invoices].sort((a, b) => b.date.localeCompare(a.date))

  function renderInvoice(inv: Invoice) {
    const patient = patients.find((p) => p.id === inv.patientId)
    const due = inv.total - inv.paid
    return (
      <ExpandableCard
        key={inv.id}
        header={
          <div className="flex flex-wrap items-center gap-2">
            {patient && <PatientAvatar id={patient.id} name={patient.name} size="sm" />}
            <span className="text-sm font-semibold">{patient ? patient.name : inv.id}</span>
            <InvoiceStatusBadge status={inv.status} />
            <span className="ml-auto text-sm font-semibold tabular">{formatCurrency(inv.total)}</span>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {inv.id} · {formatDate(inv.date)}
            {patient && (
              <>
                {' · '}
                <Link to={`/patients/${patient.id}`} className="hover:underline">
                  View profile
                </Link>
              </>
            )}
          </p>
          <div className="space-y-1.5">
            {inv.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="tabular">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paid</span>
            <span className="tabular text-success">{formatCurrency(inv.paid)}</span>
          </div>
          {due > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-warning">{formatCurrency(due)} due</span>
              <Button size="sm" onClick={() => setPayingInvoice(inv)}>
                Record payment
              </Button>
            </div>
          )}
        </div>
      </ExpandableCard>
    )
  }

  return (
    <div>
      <PageHeader title="Billing" description="Invoices, payments, and outstanding balances." />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Total billed" value={formatCurrency(totalBilled)} icon={<Receipt className="h-4 w-4" />} />
        <StatTile label="Collected" value={formatCurrency(totalPaid)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatTile
          label="Outstanding"
          value={formatCurrency(totalDue)}
          icon={totalDue > 0 ? <IndianRupee className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
          trend={outstanding.length > 0 ? `${outstanding.length} invoice${outstanding.length > 1 ? 's' : ''} pending` : 'All settled'}
          trendTone={totalDue > 0 ? 'negative' : 'positive'}
        />
      </div>

      <Tabs defaultValue="outstanding">
        <TabsList>
          <TabsTrigger value="outstanding">Outstanding ({outstanding.length})</TabsTrigger>
          <TabsTrigger value="all">All invoices ({all.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="outstanding" className="space-y-3">
          {outstanding.length === 0 ? (
            <EmptyState icon={<Wallet className="h-5 w-5" />} title="Nothing outstanding" description="Every invoice here is fully paid." />
          ) : (
            outstanding.map(renderInvoice)
          )}
        </TabsContent>
        <TabsContent value="all" className="space-y-3">
          {all.length === 0 ? (
            <EmptyState icon={<Receipt className="h-5 w-5" />} title="No invoices yet" />
          ) : (
            all.map(renderInvoice)
          )}
        </TabsContent>
      </Tabs>

      <RecordPaymentDialog invoice={payingInvoice} open={!!payingInvoice} onOpenChange={(o) => !o && setPayingInvoice(null)} />
    </div>
  )
}
