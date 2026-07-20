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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClinicStore } from '@/state/store'
import type { LeadSource, Patient } from '@/types'

const genders: Patient['gender'][] = ['Male', 'Female', 'Other']
const leadSources: LeadSource[] = ['Walk-in', 'Referral', 'Instagram', 'Facebook', 'Google']

export function EditPatientDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { updatePatient, doctors } = useClinicStore()
  const [name, setName] = useState(patient.name)
  const [age, setAge] = useState(String(patient.age))
  const [gender, setGender] = useState(patient.gender)
  const [phone, setPhone] = useState(patient.phone)
  const [address, setAddress] = useState(patient.address)
  const [leadSource, setLeadSource] = useState(patient.leadSource)
  const [primaryDoctorId, setPrimaryDoctorId] = useState(patient.primaryDoctorId)
  const [allergies, setAllergies] = useState(patient.allergies.join(', '))
  const [marketingConsent, setMarketingConsent] = useState(patient.marketingConsent)

  useEffect(() => {
    if (open) {
      setName(patient.name)
      setAge(String(patient.age))
      setGender(patient.gender)
      setPhone(patient.phone)
      setAddress(patient.address)
      setLeadSource(patient.leadSource)
      setPrimaryDoctorId(patient.primaryDoctorId)
      setAllergies(patient.allergies.join(', '))
      setMarketingConsent(patient.marketingConsent)
    }
  }, [open, patient])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Patient name is required.')
      return
    }
    const parsedAge = Number(age)
    if (!Number.isFinite(parsedAge) || parsedAge < 0) {
      toast.error('Enter a valid age.')
      return
    }
    updatePatient(patient.id, {
      name: name.trim(),
      age: parsedAge,
      gender,
      phone,
      address,
      leadSource,
      primaryDoctorId,
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
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update patient details</DialogTitle>
          <DialogDescription>{patient.name} — {patient.id}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="e-name">Full name</Label>
              <Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-age">Age</Label>
              <Input id="e-age" type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-phone">Phone (WhatsApp)</Label>
              <Input id="e-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as Patient['gender'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-address">Address</Label>
            <Textarea id="e-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lead source</Label>
              <Select value={leadSource} onValueChange={(v) => setLeadSource(v as LeadSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Primary doctor</Label>
              <Select value={primaryDoctorId} onValueChange={setPrimaryDoctorId}>
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
