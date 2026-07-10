import { useState } from 'react'
import { Pill, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { PrescriptionMedicine } from '@/data/types'

export function PrescriptionStep({
  initialMedicines,
  onSave,
  onSkip,
}: {
  initialMedicines: PrescriptionMedicine[]
  onSave: (medicines: PrescriptionMedicine[], notes: string) => void
  onSkip: () => void
}) {
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>(
    initialMedicines.length > 0 ? initialMedicines : [],
  )
  const [notes, setNotes] = useState('')

  function updateMedicine(index: number, patch: Partial<PrescriptionMedicine>) {
    setMedicines((meds) => meds.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  function addRow() {
    setMedicines((meds) => [...meds, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  function removeRow(index: number) {
    setMedicines((meds) => meds.filter((_, i) => i !== index))
  }

  const validMedicines = medicines.filter((m) => m.name.trim())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Pill className="h-4 w-4 text-primary" />
          Prescription
        </CardTitle>
        <CardDescription>
          {initialMedicines.length > 0
            ? 'Pre-filled from the consultation — adjust dosage or duration as needed.'
            : 'Add medicines if this visit needs a prescription.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {medicines.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No medicines added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {medicines.map((med, i) => (
              <div key={i} className="grid grid-cols-12 items-end gap-2 rounded-lg border border-border p-3">
                <div className="col-span-5 space-y-1">
                  <Label className="text-xs">Medicine</Label>
                  <Input value={med.name} onChange={(e) => updateMedicine(i, { name: e.target.value })} placeholder="Amoxicillin 500mg" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Dosage</Label>
                  <Input value={med.dosage} onChange={(e) => updateMedicine(i, { dosage: e.target.value })} placeholder="1 tab" />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">Frequency</Label>
                  <Input value={med.frequency} onChange={(e) => updateMedicine(i, { frequency: e.target.value })} placeholder="Twice daily" />
                </div>
                <div className="col-span-1 space-y-1">
                  <Label className="text-xs">Days</Label>
                  <Input value={med.duration} onChange={(e) => updateMedicine(i, { duration: e.target.value })} placeholder="5" />
                </div>
                <Button type="button" variant="ghost" size="icon-sm" className="col-span-1 text-muted-foreground" onClick={() => removeRow(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" />
          Add medicine
        </Button>

        <div className="space-y-1.5">
          <Label htmlFor="rx-notes">Notes for patient</Label>
          <Textarea id="rx-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="e.g. Soft diet for 2 days, avoid chewing on the left side" />
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip} className="flex-1">
            Skip — no prescription
          </Button>
          <Button onClick={() => onSave(validMedicines, notes)} disabled={validMedicines.length === 0} className="flex-1">
            Save prescription &amp; continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
