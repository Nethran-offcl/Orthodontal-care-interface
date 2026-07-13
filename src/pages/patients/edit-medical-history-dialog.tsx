import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { useClinicStore } from '@/state/store'
import type { Patient } from '@/data/types'

export function EditMedicalHistoryDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { updatePatient } = useClinicStore()
  const [allergies, setAllergies] = useState(patient.allergies.join(', '))
  const [conditions, setConditions] = useState((patient.medicalConditions ?? []).join(', '))
  const [medications, setMedications] = useState((patient.currentMedications ?? []).join(', '))
  const [notes, setNotes] = useState(patient.dentalHistoryNotes ?? '')

  useEffect(() => {
    if (open) {
      setAllergies(patient.allergies.join(', '))
      setConditions((patient.medicalConditions ?? []).join(', '))
      setMedications((patient.currentMedications ?? []).join(', '))
      setNotes(patient.dentalHistoryNotes ?? '')
    }
  }, [open, patient])

  function toList(v: string) {
    return v.split(',').map((x) => x.trim()).filter(Boolean)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updatePatient(patient.id, {
      allergies: toList(allergies),
      medicalConditions: toList(conditions),
      currentMedications: toList(medications),
      dentalHistoryNotes: notes,
    })
    toast.success('Medical & dental history updated')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Medical & dental history</DialogTitle>
          <DialogDescription>{patient.name} — {patient.id}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mh-allergies">Allergies</Label>
            <Input id="mh-allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Comma-separated" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mh-conditions">Medical conditions</Label>
            <Input id="mh-conditions" value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Comma-separated" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mh-medications">Current medications</Label>
            <Input id="mh-medications" value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="Comma-separated" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mh-notes">Dental history notes</Label>
            <Textarea id="mh-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
