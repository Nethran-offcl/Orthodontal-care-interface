import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { ExpandableCard } from '@/components/shared/expandable-card'
import { EmptyState } from '@/components/shared/empty-state'
import { InvoiceStatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RecordPaymentDialog } from '@/pages/patients/record-payment-dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/data/types'

export function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null)

  const totalBilled = invoices.reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0)
  const totalDue = totalBilled - totalPaid

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-5 w-5" />}
        title="No invoices yet"
        description="Invoices generated from visits will appear here."
      />
    )
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-border bg-secondary/30 p-3 text-center text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Total billed</p>
          <p className="font-semibold tabular">{formatCurrency(totalBilled)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total paid</p>
          <p className="font-semibold tabular text-success">{formatCurrency(totalPaid)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Balance due</p>
          <p className={`font-semibold tabular ${totalDue > 0 ? 'text-warning' : 'text-success'}`}>
            {formatCurrency(totalDue)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {invoices.map((inv) => {
          const due = inv.total - inv.paid
          return (
            <ExpandableCard
              key={inv.id}
              header={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{inv.id}</span>
                  <InvoiceStatusBadge status={inv.status} />
                  <span className="ml-auto text-sm font-semibold tabular">{formatCurrency(inv.total)}</span>
                </div>
              }
            >
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{formatDate(inv.date)}</p>
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
        })}
      </div>

      <RecordPaymentDialog invoice={payingInvoice} open={!!payingInvoice} onOpenChange={(o) => !o && setPayingInvoice(null)} />
    </div>
  )
}
