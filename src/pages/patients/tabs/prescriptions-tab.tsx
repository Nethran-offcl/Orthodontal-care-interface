import { useState } from 'react'
import { toast } from 'sonner'
import { Pill, Sparkles, Trash2 } from 'lucide-react'
import { ExpandableCard } from '@/components/shared/expandable-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useClinicStore } from '@/state/store'
import { useAuth } from '@/state/auth-state'
import { aiService } from '@/services'
import { daysFromToday } from '@/lib/date'
import { formatDate } from '@/lib/utils'
import type { Prescription, PrescriptionMedicine } from '@/types'

function DraftWithAiDialog({
  patientId,
  latestDiagnosis,
  open,
  onOpenChange,
}: {
  patientId: string
  latestDiagnosis: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { doctors, addPrescription } = useClinicStore()
  const { role, userId } = useAuth()
  const [diagnosis, setDiagnosis] = useState(latestDiagnosis)
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([])
  const [notes, setNotes] = useState('')

  async function generate() {
    setMedicines(await aiService.draftPrescription(diagnosis || 'general checkup'))
  }

  function removeMedicine(i: number) {
    setMedicines((m) => m.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    if (medicines.length === 0) {
      toast.error('Generate or add at least one medicine first.')
      return
    }
    addPrescription({
      patientId,
      date: daysFromToday(0),
      doctorId: role === 'doctor' && userId ? userId : (doctors[0]?.id ?? ''),
      medicines,
      notes,
    })
    toast.success('Prescription saved')
    onOpenChange(false)
    setMedicines([])
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Draft prescription with AI
          </DialogTitle>
          <DialogDescription>Generates a starting point from the diagnosis — review before saving.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rx-diagnosis">Diagnosis / procedure</Label>
            <div className="flex gap-2">
              <Input id="rx-diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. root canal, extraction" />
              <Button type="button" variant="outline" onClick={generate}>
                <Sparkles className="h-3.5 w-3.5" />
                Generate
              </Button>
            </div>
          </div>

          {medicines.length > 0 && (
            <div className="space-y-2">
              {medicines.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.dosage} · {m.frequency} · {m.duration}</p>
                  </div>
                  <button type="button" onClick={() => removeMedicine(i)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="rx-notes">Notes</Label>
            <Textarea id="rx-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save prescription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PrescriptionsTab({
  patientId,
  prescriptions,
  latestDiagnosis,
}: {
  patientId: string
  prescriptions: Prescription[]
  latestDiagnosis: string
}) {
  const [draftOpen, setDraftOpen] = useState(false)
  const sorted = [...prescriptions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => setDraftOpen(true)}>
          <Sparkles className="h-3.5 w-3.5" />
          Draft with AI
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={<Pill className="h-5 w-5" />} title="No prescriptions yet" />
      ) : (
        <div className="space-y-3">
          {sorted.map((rx) => (
            <ExpandableCard
              key={rx.id}
              header={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{rx.id}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{formatDate(rx.date)}</span>
                </div>
              }
            >
              <div className="space-y-2">
                {rx.medicines.map((m, i) => (
                  <div key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.dosage} · {m.frequency} · {m.duration}</p>
                  </div>
                ))}
                {rx.notes && <p className="text-sm italic text-muted-foreground">{rx.notes}</p>}
              </div>
            </ExpandableCard>
          ))}
        </div>
      )}

      <DraftWithAiDialog patientId={patientId} latestDiagnosis={latestDiagnosis} open={draftOpen} onOpenChange={setDraftOpen} />
    </div>
  )
}
