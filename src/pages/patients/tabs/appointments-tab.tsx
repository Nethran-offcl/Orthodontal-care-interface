import { CalendarDays } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppointmentRow, AppointmentRowButton } from '@/components/shared/appointment-row'
import { EmptyState } from '@/components/shared/empty-state'
import { useClinicStore } from '@/state/store'
import type { Appointment, Patient } from '@/types'

export function AppointmentsTab({ patient, appointments }: { patient: Patient; appointments: Appointment[] }) {
  const { doctors } = useClinicStore()
  const sorted = [...appointments].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  const upcoming = sorted.filter((a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'checked-in')
  const past = [...sorted]
    .filter((a) => a.status === 'completed' || a.status === 'no-show' || a.status === 'cancelled')
    .reverse()

  function renderList(list: Appointment[], emptyLabel: string) {
    if (list.length === 0) {
      return <EmptyState icon={<CalendarDays className="h-5 w-5" />} title={emptyLabel} className="border-none py-10" />
    }
    return (
      <div className="space-y-1">
        {list.map((a) => (
          <AppointmentRow
            key={a.id}
            appointment={a}
            patient={patient}
            doctor={doctors.find((d) => d.id === a.doctorId)}
            showDoctor
            action={<AppointmentRowButton to={`/appointments?focus=${a.id}`} label="Manage" />}
          />
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
        <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        <TabsTrigger value="all">All ({sorted.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">{renderList(upcoming, 'No upcoming visits')}</TabsContent>
      <TabsContent value="past">{renderList(past, 'No past visits yet')}</TabsContent>
      <TabsContent value="all">{renderList([...upcoming, ...past], 'No appointments on record')}</TabsContent>
    </Tabs>
  )
}
