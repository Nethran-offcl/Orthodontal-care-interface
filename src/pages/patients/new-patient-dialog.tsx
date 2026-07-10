import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { doctors } from '@/data'
import { daysFromToday } from '@/data/dates'
import { useClinicStore } from '@/state/store'
import type { LeadSource } from '@/data/types'

const leadSources: LeadSource[] = ['Walk-in', 'Referral', 'Google', 'Instagram', 'Facebook']

export function NewPatientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addPatient } = useClinicStore()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Other')
  const [address, setAddress] = useState('')
  const [leadSource, setLeadSource] = useState<LeadSource>('Walk-in')
  const [primaryDoctorId, setPrimaryDoctorId] = useState(doctors[0].id)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [detailed, setDetailed] = useState(false)

  function reset() {
    setName('')
    setPhone('')
    setAge('')
    setGender('Other')
    setAddress('')
    setLeadSource('Walk-in')
    setPrimaryDoctorId(doctors[0].id)
    setMarketingConsent(false)
    setDetailed(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !phone || !age) {
      toast.error('Name, phone, and age are required to hold a slot.')
      return
    }

    const completeness = detailed || address ? 100 : 40
    const patient = addPatient({
      name,
      phone,
      age: Number(age),
      gender,
      address,
      leadSource,
      registeredOn: daysFromToday(0),
      allergies: [],
      marketingConsent,
      profileCompleteness: completeness,
      balanceDue: 0,
      totalBilled: 0,
      primaryDoctorId,
    })

    toast.success('Patient registered', { description: `${patient.name} — ${patient.id}` })
    onOpenChange(false)
    reset()
    navigate(`/patients/${patient.id}`)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Register new patient
          </DialogTitle>
          <DialogDescription>
            Capture the essentials now — you can fill in the rest whenever there's downtime.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="p-name">Full name</Label>
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Patient name" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-age">Age</Label>
              <Input id="p-age" type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="p-phone">Phone (WhatsApp)</Label>
              <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxx xxxxx" />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!detailed ? (
            <button
              type="button"
              onClick={() => setDetailed(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              + Add address, lead source &amp; consent now
            </button>
          ) : (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-address">Address</Label>
                <Input id="p-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, city" />
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
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={marketingConsent} onCheckedChange={(v) => setMarketingConsent(v === true)} className="mt-0.5" />
                <span>
                  Patient has given written marketing consent
                  <span className="block text-xs text-muted-foreground">
                    Separate from clinical treatment photos — only applies to social/marketing use.
                  </span>
                </span>
              </label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Register patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
