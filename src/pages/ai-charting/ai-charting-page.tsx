import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, Mic, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { formatDate } from '@/lib/utils'

function confidenceFor(id: string) {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 1000
  return 72 + (hash % 27)
}

export function AiChartingPage() {
  const { role, userId } = useAuth()
  const { chartEntries, patients } = useClinicStore()
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set())

  const voiceEntries = useMemo(() => {
    const scoped = role === 'doctor' && userId ? chartEntries.filter((c) => c.doctorId === userId) : chartEntries
    return scoped.filter((c) => c.source === 'voice').sort((a, b) => b.date.localeCompare(a.date))
  }, [chartEntries, role, userId])

  const pending = voiceEntries.filter((e) => !confirmed.has(e.id))
  const avgConfidence = voiceEntries.length
    ? Math.round(voiceEntries.reduce((s, e) => s + confidenceFor(e.id), 0) / voiceEntries.length)
    : 0

  function confirm(id: string) {
    setConfirmed((s) => new Set(s).add(id))
    toast.success('Chart entry confirmed')
  }

  return (
    <div>
      <PageHeader
        title="AI Charting"
        description="Review voice-to-chart entries before they're treated as final."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Voice-charted entries" value={voiceEntries.length} icon={<Mic className="h-4 w-4" />} />
        <StatTile label="Needs review" value={pending.length} icon={<Sparkles className="h-4 w-4" />} trend={pending.length > 0 ? 'Awaiting confirmation' : undefined} trendTone={pending.length > 0 ? 'negative' : 'neutral'} />
        <StatTile label="Avg. AI confidence" value={`${avgConfidence}%`} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {voiceEntries.length === 0 ? (
        <EmptyState
          icon={<Mic className="h-5 w-5" />}
          title="No AI-charted entries yet"
          description="Entries created via voice-to-chart during a consultation will show up here for review."
        />
      ) : (
        <div className="space-y-3">
          {voiceEntries.map((entry) => {
            const patient = patients.find((p) => p.id === entry.patientId)
            const confidence = confidenceFor(entry.id)
            const isConfirmed = confirmed.has(entry.id)
            return (
              <Card key={entry.id}>
                <CardContent className="space-y-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {patient && <PatientAvatar id={patient.id} name={patient.name} size="sm" />}
                    <Link to={`/patients/${entry.patientId}?tab=chart`} className="text-sm font-semibold hover:underline">
                      {patient?.name ?? entry.patientId}
                    </Link>
                    <Badge variant={confidence >= 85 ? 'success' : confidence >= 75 ? 'warning' : 'destructive'}>
                      {confidence}% confidence
                    </Badge>
                    {isConfirmed && <Badge variant="secondary">Confirmed</Badge>}
                    <span className="ml-auto text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Diagnosis</p>
                      <p className="text-sm">{entry.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Procedure</p>
                      <p className="text-sm">{entry.procedure}</p>
                    </div>
                  </div>
                  {entry.transcript && (
                    <p className="rounded-lg bg-secondary/40 p-3 text-xs italic leading-relaxed text-muted-foreground">
                      "{entry.transcript}"
                    </p>
                  )}
                  {!isConfirmed && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => confirm(entry.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/patients/${entry.patientId}?tab=chart`}>Needs review</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
