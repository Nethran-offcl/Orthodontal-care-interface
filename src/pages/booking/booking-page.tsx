import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CalendarPlus, Clock, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClinicStore } from '@/state/store'
import { aiService } from '@/services'
import { daysFromToday, TODAY_ISO } from '@/lib/date'

const durations = [15, 20, 30, 45, 60]
const dayStartMin = 9 * 60
const dayEndMin = 18 * 60
const slotStepMin = 30

function toTime(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function BookingPage() {
  const { patients, doctors, appointments, addAppointment, sendMessage } = useClinicStore()
  const navigate = useNavigate()

  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? '')
  const [date, setDate] = useState(TODAY_ISO)
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState(30)
  const [reason, setReason] = useState('')

  const openSlots = useMemo(() => {
    const booked = new Set(
      appointments
        .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
        .map((a) => a.startTime),
    )
    const slots: string[] = []
    for (let m = dayStartMin; m < dayEndMin; m += slotStepMin) {
      const t = toTime(m)
      if (!booked.has(t)) slots.push(t)
    }
    return slots.slice(0, 8)
  }, [appointments, doctorId, date])

  const [recommendedSlot, setRecommendedSlot] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    aiService.suggestAppointmentSlot(openSlots).then((slot) => {
      if (alive) setRecommendedSlot(slot)
    })
    return () => {
      alive = false
    }
  }, [openSlots])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) {
      toast.error('Select a patient to continue.')
      return
    }
    if (!reason.trim()) {
      toast.error('Add a reason for the visit.')
      return
    }

    const appt = await addAppointment({
      patientId,
      doctorId,
      date,
      startTime: time,
      durationMin: duration,
      status: 'confirmed',
      reason,
      isFollowUp: false,
    })

    const patient = patients.find((p) => p.id === patientId)
    const doctor = doctors.find((d) => d.id === doctorId)
    if (patient) {
      sendMessage(
        patientId,
        `Thank you, ${patient.name.split(' ')[0]}! Your appointment on ${date} at ${time} with ${doctor?.name} is confirmed.`,
      )
    }

    toast.success('Appointment booked', {
      description: `${patient?.name ?? patientId} · ${date} at ${time}`,
    })
    navigate(`/appointments?focus=${appt.id}`)
  }

  return (
    <div>
      <PageHeader title="Booking" description="Fast slot booking for walk-ins and phone calls." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              New booking
            </CardTitle>
            <CardDescription>A confirmation is sent to the patient on WhatsApp automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="booking-date">Date</Label>
                  <Input id="booking-date" type="date" min={daysFromToday(0)} value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-time">Time</Label>
                  <Input id="booking-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-reason">Reason for visit</Label>
                <Input
                  id="booking-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. tooth pain, cleaning, consultation"
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Book &amp; send confirmation
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Open slots
            </CardTitle>
            <CardDescription>
              {doctors.find((d) => d.id === doctorId)?.name} · {date === TODAY_ISO ? 'Today' : date}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedSlot && (
              <Badge variant="accent" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI recommends {recommendedSlot}
              </Badge>
            )}
            <div className="grid grid-cols-2 gap-2">
              {openSlots.length === 0 ? (
                <p className="col-span-2 text-sm text-muted-foreground">No open slots left in the day.</p>
              ) : (
                openSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`relative rounded-md border px-2.5 py-1.5 text-sm font-medium tabular transition-colors ${
                      slot === time ? 'border-primary bg-accent text-accent-foreground' : 'border-border hover:bg-secondary/60'
                    }`}
                  >
                    {slot}
                    {slot === recommendedSlot && (
                      <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
