import { useState } from 'react'
import { toast } from 'sonner'
import { IndianRupee } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClinicStore } from '@/state/store'
import { formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/types'

export function RecordPaymentDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { recordPayment } = useClinicStore()
  const due = invoice ? invoice.total - invoice.paid : 0
  const [amount, setAmount] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!invoice) return
    const value = Number(amount)
    if (!value || value <= 0) {
      toast.error('Enter a valid amount.')
      return
    }
    recordPayment(invoice.id, Math.min(value, due))
    toast.success('Payment recorded', { description: `${formatCurrency(Math.min(value, due))} against ${invoice.id}` })
    onOpenChange(false)
    setAmount('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setAmount('') }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Record payment
          </DialogTitle>
          <DialogDescription>
            {invoice?.id} — {formatCurrency(due)} due
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Amount received (₹)</Label>
            <Input
              id="pay-amount"
              type="number"
              min={1}
              max={due}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(due)}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAmount(String(due))}>
              Full amount
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Record payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
