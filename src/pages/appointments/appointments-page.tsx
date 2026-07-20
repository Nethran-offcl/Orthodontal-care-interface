import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DayView } from '@/pages/appointments/day-view'
import { WeekView } from '@/pages/appointments/week-view'
import { MonthView } from '@/pages/appointments/month-view'
import { NewAppointmentDialog } from '@/pages/appointments/new-appointment-dialog'
import { AppointmentDetailSheet } from '@/pages/appointments/appointment-detail-sheet'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { iso } from '@/lib/date'

type ViewMode = 'day' | 'week' | 'month'

export function AppointmentsPage() {
  const { role, userId } = useAuth()
  const { appointments, patients, doctors } = useClinicStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const [view, setView] = useState<ViewMode>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [doctorFilter, setDoctorFilter] = useState<string>(role === 'doctor' && userId ? userId : 'all')
  const [newOpen, setNewOpen] = useState(false)
  const [focusedId, setFocusedId] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setNewOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
    const focus = searchParams.get('focus')
    if (focus) {
      setFocusedId(focus)
      const appt = appointments.find((a) => a.id === focus)
      if (appt) setSelectedDate(new Date(appt.date))
      const next = new URLSearchParams(searchParams)
      next.delete('focus')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scopedAppointments = useMemo(() => {
    if (doctorFilter === 'all') return appointments
    return appointments.filter((a) => a.doctorId === doctorFilter)
  }, [appointments, doctorFilter])

  const dayIso = iso(selectedDate)
  const dayAppointments = scopedAppointments
    .filter((a) => a.date === dayIso)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate)
    const end = endOfWeek(selectedDate)
    const days: Date[] = []
    let cursor = start
    while (cursor <= end) {
      days.push(cursor)
      cursor = addDays(cursor, 1)
    }
    return days
  }, [selectedDate])

  function navigate(direction: -1 | 1) {
    if (view === 'day') setSelectedDate((d) => (direction === 1 ? addDays(d, 1) : subDays(d, 1)))
    if (view === 'week') setSelectedDate((d) => (direction === 1 ? addWeeks(d, 1) : subWeeks(d, 1)))
    if (view === 'month') setSelectedDate((d) => (direction === 1 ? addMonths(d, 1) : subMonths(d, 1)))
  }

  const headerLabel =
    view === 'month'
      ? format(selectedDate, 'MMMM yyyy')
      : view === 'week'
        ? `${format(startOfWeek(selectedDate), 'd MMM')} – ${format(endOfWeek(selectedDate), 'd MMM yyyy')}`
        : format(selectedDate, 'EEEE, d MMMM yyyy')

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Book, confirm, and manage every visit across the clinic."
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <CalendarPlus className="h-4 w-4" />
            Book appointment
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => navigate(-1)} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => navigate(1)} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-1 text-sm font-medium">{headerLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {role !== 'doctor' && (
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All doctors</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          {view === 'day' && (
            <DayView
              appointments={dayAppointments}
              patients={patients}
              doctors={doctors}
              showDoctor={role !== 'doctor'}
              onSelect={setFocusedId}
            />
          )}
          {view === 'week' && (
            <WeekView
              weekDays={weekDays}
              appointments={scopedAppointments}
              patients={patients}
              selectedDate={selectedDate}
              onSelectDay={(d) => {
                setSelectedDate(d)
                setView('day')
              }}
              onSelectAppointment={setFocusedId}
            />
          )}
          {view === 'month' && (
            <MonthView
              monthAnchor={selectedDate}
              selectedDate={selectedDate}
              appointments={scopedAppointments}
              onSelectDay={(d) => {
                setSelectedDate(d)
                setView('day')
              }}
            />
          )}
        </CardContent>
      </Card>

      <NewAppointmentDialog open={newOpen} onOpenChange={setNewOpen} />
      <AppointmentDetailSheet appointmentId={focusedId} onOpenChange={(o) => !o && setFocusedId(null)} />
    </div>
  )
}
