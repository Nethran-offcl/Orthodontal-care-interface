import { Link } from 'react-router-dom'
import { Pill } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { ExpandableCard } from '@/components/shared/expandable-card'
import { EmptyState } from '@/components/shared/empty-state'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { formatDate } from '@/lib/utils'

export function PrescriptionsPage() {
  const { role, userId } = useAuth()
  const { prescriptions, patients } = useClinicStore()

  const scoped = (role === 'doctor' && userId ? prescriptions.filter((rx) => rx.doctorId === userId) : prescriptions)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <PageHeader title="Prescriptions" description={`${scoped.length} prescriptions on record`} />

      {scoped.length === 0 ? (
        <EmptyState
          icon={<Pill className="h-5 w-5" />}
          title="No prescriptions yet"
          description="Prescriptions written during consultations will appear here."
        />
      ) : (
        <div className="space-y-3">
          {scoped.map((rx) => {
            const patient = patients.find((p) => p.id === rx.patientId)
            return (
              <ExpandableCard
                key={rx.id}
                header={
                  <div className="flex flex-wrap items-center gap-2">
                    {patient && <PatientAvatar id={patient.id} name={patient.name} size="sm" />}
                    <span className="text-sm font-semibold">{patient?.name ?? rx.id}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{formatDate(rx.date)}</span>
                  </div>
                }
              >
                <div className="space-y-3">
                  {patient && (
                    <p className="text-xs text-muted-foreground">
                      {rx.id} ·{' '}
                      <Link to={`/patients/${patient.id}`} className="hover:underline">
                        View profile
                      </Link>
                    </p>
                  )}
                  <div className="space-y-2">
                    {rx.medicines.map((m, i) => (
                      <div key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.dosage} · {m.frequency} · {m.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                  {rx.notes && <p className="text-sm italic text-muted-foreground">{rx.notes}</p>}
                </div>
              </ExpandableCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
