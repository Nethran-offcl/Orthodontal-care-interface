import { Users2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { AppointmentRow, AppointmentRowButton } from '@/components/shared/appointment-row'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { getTodaysAppointments } from '@/data'
import { formatDate } from '@/lib/utils'

export function TodayPatientsPage() {
  const { userId } = useAuth()
  const { appointments, patients } = useClinicStore()
  const currentDoctorId = userId ?? ''

  const todays = getTodaysAppointments(currentDoctorId).map((a) => {
    const live = appointments.find((x) => x.id === a.id) ?? a
    return { ...live, patient: patients.find((p) => p.id === live.patientId) }
  })

  return (
    <div>
      <PageHeader
        title="Today's patients"
        description={formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
      />

      <Card>
        <CardContent className="space-y-1 p-4 sm:p-5">
          {todays.length === 0 ? (
            <EmptyState
              icon={<Users2 className="h-5 w-5" />}
              title="No appointments today"
              description="Enjoy the quiet — or check tomorrow's schedule on the calendar."
            />
          ) : (
            todays.map((a) => (
              <AppointmentRow
                key={a.id}
                appointment={a}
                patient={a.patient}
                action={
                  a.status !== 'completed' && a.status !== 'cancelled' && a.status !== 'no-show' ? (
                    <AppointmentRowButton to={`/consultation/${a.id}`} label="Open" />
                  ) : (
                    <AppointmentRowButton to={`/patients/${a.patientId}`} label="View" />
                  )
                }
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
