import { Mic } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { getDoctor } from '@/data'
import { formatDate } from '@/lib/utils'
import type { ChartEntry } from '@/data/types'

export function VoiceNotesTab({ entries }: { entries: ChartEntry[] }) {
  const voiceEntries = entries.filter((e) => e.source === 'voice').sort((a, b) => b.date.localeCompare(a.date))

  if (voiceEntries.length === 0) {
    return (
      <EmptyState
        icon={<Mic className="h-5 w-5" />}
        title="No voice notes yet"
        description="Recordings from voice-to-chart consultations will appear here, transcript first."
      />
    )
  }

  return (
    <div className="space-y-3">
      {voiceEntries.map((entry) => {
        const doctor = getDoctor(entry.doctorId)
        return (
          <Card key={entry.id}>
            <CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="gap-1">
                  <Mic className="h-3 w-3" />
                  Voice-to-chart
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(entry.date)} · {entry.toothArea} · {doctor?.name}
                </span>
              </div>
              {entry.transcript && (
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Transcript</p>
                  <p className="text-sm italic leading-relaxed text-foreground">"{entry.transcript}"</p>
                </div>
              )}
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
