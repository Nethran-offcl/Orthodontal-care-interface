import { useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { daysFromToday } from '@/data/dates'
import { useClinicStore } from '@/state/store'

export function AddStageDialog({
  planId,
  open,
  onOpenChange,
}: {
  planId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { addTreatmentStage } = useClinicStore()
  const [label, setLabel] = useState('')
  const [targetDate, setTargetDate] = useState(daysFromToday(14))
  const [cost, setCost] = useState('')

  function reset() {
    setLabel('')
    setTargetDate(daysFromToday(14))
    setCost('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label) {
      toast.error('Describe the stage.')
      return
    }
    addTreatmentStage(planId, { label, targetDate, status: 'planned', cost: Number(cost) || 0 })
    toast.success('Stage added to treatment plan')
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add treatment stage
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="stage-label">Stage description</Label>
            <Input id="stage-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Crown fitting & cementation" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stage-date">Target date</Label>
              <Input id="stage-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stage-cost">Cost estimate (₹)</Label>
              <Input id="stage-cost" type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add stage</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
