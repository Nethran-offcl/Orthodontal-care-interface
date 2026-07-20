import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CalendarPlus, UserPlus, Users } from 'lucide-react'
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
import { useClinicStore } from '@/state/store'
import { daysFromToday } from '@/lib/date'
import type { LeadSource } from '@/types'

const durations = [15, 20, 30, 45, 60]

export function NewAppointmentDialog({
  open,
  onOpenChange,
  defaultPatientId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPatientId?: string
}) {
  const { patients, doctors, addPatient, addAppointment, sendMessage } = useClinicStore()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'existing' | 'new'>(defaultPatientId ? 'existing' : 'existing')
  const [patientId, setPatientId] = useState(defaultPatientId ?? '')
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newAge, setNewAge] = useState('')

  const [doctorId, setDoctorId] = useState(doctors[0].id)
  const [date, setDate] = useState(daysFromToday(1))
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState(30)
  const [reason, setReason] = useState('')
  const [isFollowUp, setIsFollowUp] = useState(false)

  function reset() {
    setMode('existing')
    setPatientId('')
    setNewName('')
    setNewPhone('')
    setNewAge('')
    setDoctorId(doctors[0].id)
    setDate(daysFromToday(1))
    setTime('10:00')
    setDuration(30)
    setReason('')
    setIsFollowUp(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let finalPatientId = patientId
    let patientName = patients.find((p) => p.id === patientId)?.name ?? ''

    if (mode === 'new') {
      if (!newName || !newPhone || !newAge) {
        toast.error('Enter name, phone, and age to register the patient.')
        return
      }
      const created = await addPatient({
        name: newName,
        phone: newPhone,
        age: Number(newAge),
        gender: 'Other',
        address: '',
        leadSource: 'Walk-in' as LeadSource,
        registeredOn: daysFromToday(0),
        allergies: [],
        marketingConsent: false,
        profileCompleteness: 40,
        balanceDue: 0,
        totalBilled: 0,
        primaryDoctorId: doctorId,
      })
      finalPatientId = created.id
      patientName = created.name
    }

    if (!finalPatientId) {
      toast.error('Select a patient to continue.')
      return
    }
    if (!reason) {
      toast.error('Add a reason for the visit.')
      return
    }

    const appt = await addAppointment({
      patientId: finalPatientId,
      doctorId,
      date,
      startTime: time,
      durationMin: duration,
      status: 'confirmed',
      reason,
      isFollowUp,
    })

    const doctor = doctors.find((d) => d.id === doctorId)
    sendMessage(
      finalPatientId,
      `Thank you, ${patientName.split(' ')[0]}! Your appointment on ${date} at ${time} with ${doctor?.name} is confirmed. We look forward to seeing you.`,
    )

    toast.success('Appointment booked', {
      description: `${patientName} · ${date} at ${time} — confirmation sent via WhatsApp.`,
    })

    onOpenChange(false)
    reset()
    navigate(`/appointments?focus=${appt.id}`)
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
            <CalendarPlus className="h-4 w-4" />
            Book appointment
          </DialogTitle>
          <DialogDescription>
            Register a new patient and book their first visit in one step, or find an existing one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                mode === 'existing' ? 'border-primary bg-accent text-accent-foreground' : 'border-input text-muted-foreground'
              }`}
            >
              <Users className="h-4 w-4" />
              Existing patient
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                mode === 'new' ? 'border-primary bg-accent text-accent-foreground' : 'border-input text-muted-foreground'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              New patient
            </button>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-1.5">
              <Label>Patient</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Search by name…" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="new-name">Full name</Label>
                <Input id="new-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Patient name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-age">Age</Label>
                <Input id="new-age" type="number" min={0} value={newAge} onChange={(e) => setNewAge(e.target.value)} />
              </div>
              <div className="col-span-3 space-y-1.5">
                <Label htmlFor="new-phone">Phone (WhatsApp)</Label>
                <Input id="new-phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91 98xxx xxxxx" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
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
              <Label>Duration</Label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason for visit</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. 6-month cleaning, tooth pain, follow-up"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isFollowUp} onCheckedChange={(v) => setIsFollowUp(v === true)} />
            This is a follow-up visit
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Book &amp; send confirmation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
