import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CalendarDays,
  FileText,
  History,
  ImageIcon,
  MessageCircle,
  Pill,
  Receipt,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { useClinicStore } from '@/state/store'
import { generateFollowUpMessage } from '@/lib/ai-mock'
import { buildPatientTimeline } from '@/lib/patient-timeline'
import type { TimelineEventType } from '@/lib/patient-timeline'
import { formatDate } from '@/lib/utils'
import type { Patient } from '@/data/types'

const iconMap: Record<TimelineEventType, typeof CalendarDays> = {
  appointment: CalendarDays,
  chart: FileText,
  image: ImageIcon,
  prescription: Pill,
  payment: Receipt,
  message: MessageCircle,
}

export function PatientTimelineTab({ patient }: { patient: Patient }) {
  const { appointments, chartEntries, images, prescriptions, invoices, conversations, treatmentPlans, sendMessage } = useClinicStore()
  const [suggestion, setSuggestion] = useState<string | null>(null)

  const events = buildPatientTimeline(patient.id, { appointments, chartEntries, images, prescriptions, invoices, conversations })
  const activePlan = treatmentPlans.find((p) => p.patientId === patient.id && p.status === 'active')
  const nextStage = activePlan?.stages.find((s) => s.status !== 'completed')

  function handleSuggestFollowUp() {
    const text = generateFollowUpMessage(patient.name, activePlan?.title ?? 'their treatment', nextStage?.label)
    setSuggestion(text)
  }

  function handleSendFollowUp() {
    if (!suggestion) return
    sendMessage(patient.id, suggestion)
    toast.success('Follow-up sent via WhatsApp')
    setSuggestion(null)
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-accent/30">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              AI follow-up generator
            </CardTitle>
            <CardDescription>Draft a check-in based on this patient's treatment plan.</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleSuggestFollowUp}>
            <Sparkles className="h-3.5 w-3.5" />
            Suggest follow-up
          </Button>
        </CardHeader>
        {suggestion && (
          <CardContent className="space-y-3">
            <p className="rounded-lg bg-secondary/50 p-3 text-sm leading-relaxed">{suggestion}</p>
            <Button size="sm" onClick={handleSendFollowUp}>
              Send via WhatsApp
            </Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          {events.length === 0 ? (
            <EmptyState icon={<History className="h-5 w-5" />} title="No activity yet" className="border-none" />
          ) : (
            <div className="space-y-1">
              {events.map((ev) => {
                const Icon = iconMap[ev.type]
                return (
                  <Link
                    key={ev.id}
                    to={ev.href}
                    className="flex items-start gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-secondary/40"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{ev.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{ev.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(ev.date, { day: 'numeric', month: 'short' })}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
