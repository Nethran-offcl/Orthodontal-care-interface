import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Search, Stethoscope } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { formatDate } from '@/lib/utils'

export function PatientTimelinePage() {
  const { role, userId } = useAuth()
  const { chartEntries, patients } = useClinicStore()
  const [query, setQuery] = useState('')

  const feed = useMemo(() => {
    const scoped = role === 'doctor' && userId ? chartEntries.filter((c) => c.doctorId === userId) : chartEntries
    return [...scoped].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30)
  }, [chartEntries, role, userId])

  const matchingPatients = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return patients
      .filter((p) => p.name.toLowerCase().includes(q) || p.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
      .slice(0, 6)
  }, [patients, query])

  return (
    <div>
      <PageHeader title="Patient timeline" description="Recent chart activity across your patients." />

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Jump to a patient's timeline…"
          className="pl-9"
        />
        {matchingPatients.length > 0 && (
          <Card className="absolute z-10 mt-1 w-full overflow-hidden py-1">
            {matchingPatients.map((p) => (
              <Link
                key={p.id}
                to={`/patients/${p.id}?tab=chart`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-secondary/50"
              >
                <PatientAvatar id={p.id} name={p.name} size="sm" />
                <span className="truncate">{p.name}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">{p.id}</span>
              </Link>
            ))}
          </Card>
        )}
      </div>

      <Card>
        <CardContent className="space-y-1 p-4 sm:p-5">
          {feed.length === 0 ? (
            <EmptyState icon={<History className="h-5 w-5" />} title="No chart activity yet" />
          ) : (
            feed.map((entry) => {
              const patient = patients.find((p) => p.id === entry.patientId)
              return (
                <Link
                  key={entry.id}
                  to={`/patients/${entry.patientId}?tab=chart`}
                  className="flex items-start gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-secondary/40"
                >
                  {patient && <PatientAvatar id={patient.id} name={patient.name} size="sm" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{patient?.name ?? 'Unknown patient'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.toothArea} · {entry.diagnosis}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted-foreground">
                    <span>{formatDate(entry.date, { day: 'numeric', month: 'short' })}</span>
                    {entry.source === 'voice' && (
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" /> Voice
                      </span>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
