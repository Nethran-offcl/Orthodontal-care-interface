import { useState } from 'react'
import { toast } from 'sonner'
import { ClipboardPlus } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { doctors } from '@/data'
import { daysFromToday } from '@/data/dates'
import { useClinicStore } from '@/state/store'
import { useAppState } from '@/state/app-state'

export function NewTreatmentPlanDialog({
  patientId,
  open,
  onOpenChange,
}: {
  patientId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { addTreatmentPlan } = useClinicStore()
  const { currentDoctorId } = useAppState()
  const [title, setTitle] = useState('')
  const [doctorId, setDoctorId] = useState(currentDoctorId)
  const [firstStage, setFirstStage] = useState('')
  const [targetDate, setTargetDate] = useState(daysFromToday(7))
  const [cost, setCost] = useState('')

  function reset() {
    setTitle('')
    setDoctorId(currentDoctorId)
    setFirstStage('')
    setTargetDate(daysFromToday(7))
    setCost('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !firstStage) {
      toast.error('Add a plan title and its first stage.')
      return
    }
    addTreatmentPlan({
      patientId,
      title,
      createdOn: daysFromToday(0),
      createdByDoctorId: doctorId,
      status: 'active',
      stages: [
        {
          id: 'seed',
          label: firstStage,
          targetDate,
          status: 'planned',
          cost: Number(cost) || 0,
        },
      ],
    })
    toast.success('Treatment plan created')
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPlus className="h-4 w-4" />
            New treatment plan
          </DialogTitle>
          <DialogDescription>
            This becomes the source of truth for this patient's follow-up reminders.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tp-title">Plan title</Label>
            <Input id="tp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Root Canal — Lower Left Molar (36)" />
          </div>
          <div className="space-y-1.5">
            <Label>Doctor</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tp-stage">First stage</Label>
            <Input id="tp-stage" value={firstStage} onChange={(e) => setFirstStage(e.target.value)} placeholder="e.g. Access opening & pulp extirpation" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tp-date">Target date</Label>
              <Input id="tp-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tp-cost">Cost estimate (₹)</Label>
              <Input id="tp-cost" type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
