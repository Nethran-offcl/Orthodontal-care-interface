import { FileText, Mic, PenLine, Pill } from 'lucide-react'
import { ExpandableCard } from '@/components/shared/expandable-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { getDoctor } from '@/data'
import { formatDate } from '@/lib/utils'
import type { ChartEntry, Prescription } from '@/data/types'

export function ChartHistoryTab({
  entries,
  prescriptions,
}: {
  entries: ChartEntry[]
  prescriptions: Prescription[]
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" />}
        title="No chart entries yet"
        description="Notes from consultations — dictated or typed — will appear here."
      />
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const doctor = getDoctor(entry.doctorId)
        const rx = prescriptions.find((p) => p.chartEntryId === entry.id)
        return (
          <ExpandableCard
            key={entry.id}
            header={
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{entry.diagnosis}</span>
                  <Badge variant={entry.source === 'voice' ? 'accent' : 'secondary'} className="gap-1">
                    {entry.source === 'voice' ? <Mic className="h-3 w-3" /> : <PenLine className="h-3 w-3" />}
                    {entry.source === 'voice' ? 'Voice-to-chart' : 'Manual'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(entry.date)} · {entry.toothArea} · {doctor?.name}
                </p>
              </div>
            }
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Procedure</p>
                <p className="text-sm">{entry.procedure}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
                <p className="text-sm leading-relaxed text-foreground">{entry.notes}</p>
              </div>
              {entry.transcript && (
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Mic className="h-3 w-3" /> Original voice transcript
                  </p>
                  <p className="text-sm italic leading-relaxed text-muted-foreground">"{entry.transcript}"</p>
                </div>
              )}
              {rx && (
                <div className="rounded-lg border border-primary/20 bg-accent/40 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
                    <Pill className="h-3 w-3" /> Prescribed this visit
                  </p>
                  <ul className="space-y-1">
                    {rx.medicines.map((m) => (
                      <li key={m.name} className="text-sm">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-muted-foreground"> — {m.dosage}, {m.frequency}, {m.duration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ExpandableCard>
        )
      })}
    </div>
  )
}
