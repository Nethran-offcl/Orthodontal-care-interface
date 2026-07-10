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
import { Checkbox } from '@/components/ui/checkbox'
import { useClinicStore } from '@/state/store'
import type { Patient } from '@/data/types'

export function EditPatientDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { updatePatient } = useClinicStore()
  const [phone, setPhone] = useState(patient.phone)
  const [address, setAddress] = useState(patient.address)
  const [allergies, setAllergies] = useState(patient.allergies.join(', '))
  const [marketingConsent, setMarketingConsent] = useState(patient.marketingConsent)

  useEffect(() => {
    if (open) {
      setPhone(patient.phone)
      setAddress(patient.address)
      setAllergies(patient.allergies.join(', '))
      setMarketingConsent(patient.marketingConsent)
    }
  }, [open, patient])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updatePatient(patient.id, {
      phone,
      address,
      allergies: allergies
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      marketingConsent,
      profileCompleteness: 100,
    })
    toast.success('Patient details updated')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update patient details</DialogTitle>
          <DialogDescription>{patient.name} — {patient.id}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="e-phone">Phone (WhatsApp)</Label>
            <Input id="e-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-address">Address</Label>
            <Textarea id="e-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-allergies">Allergies</Label>
            <Input
              id="e-allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Comma-separated, e.g. Penicillin, Latex"
            />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={marketingConsent} onCheckedChange={(v) => setMarketingConsent(v === true)} className="mt-0.5" />
            <span>Patient has given written marketing consent</span>
          </label>
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
