import { useEffect, useMemo, useState } from 'react'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import { Search, UserPlus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { NewPatientDialog } from '@/pages/patients/new-patient-dialog'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { getDoctor } from '@/data'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

export function PatientsListPage() {
  const { role } = useAppState()
  const { patients, appointments } = useClinicStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [newOpen, setNewOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setNewOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = !q
      ? patients
      : patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            p.id.toLowerCase().includes(q),
        )
    return [...list].sort((a, b) => b.registeredOn.localeCompare(a.registeredOn))
  }, [patients, query])

  function lastVisit(patientId: string) {
    const past = appointments
      .filter((a) => a.patientId === patientId && a.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date))
    return past[0]?.date
  }

  if (role === 'patient') return <Navigate to="/" replace />

  return (
    <div>
      <PageHeader
        title="Patients"
        description={`${patients.length} patients on record`}
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <UserPlus className="h-4 w-4" />
            New patient
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, or ID…"
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No patients match your search"
              description="Try a different name, phone number, or patient ID."
              className="border-none"
            />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((p) => {
                const doctor = getDoctor(p.primaryDoctorId)
                const visit = lastVisit(p.id)
                return (
                  <Link
                    key={p.id}
                    to={`/patients/${p.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/40"
                  >
                    <PatientAvatar id={p.id} name={p.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        {p.profileCompleteness < 100 && (
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            {p.profileCompleteness}% complete
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.id} · {p.age} yrs · {p.phone}
                      </p>
                    </div>

                    <div className="hidden w-36 shrink-0 text-xs text-muted-foreground md:block">
                      {doctor?.name ?? '—'}
                    </div>

                    <div className="hidden w-28 shrink-0 text-xs text-muted-foreground sm:block">
                      {visit ? `Last visit ${formatDate(visit, { day: 'numeric', month: 'short' })}` : 'No visits yet'}
                    </div>

                    <div className="w-28 shrink-0 text-right">
                      <span
                        className={cn(
                          'text-sm font-semibold tabular',
                          p.balanceDue > 0 ? 'text-warning' : 'text-success',
                        )}
                      >
                        {p.balanceDue > 0 ? formatCurrency(p.balanceDue) : 'Settled'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <NewPatientDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}
