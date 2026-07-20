import { useEffect, useState } from 'react'
import { AlertTriangle, IndianRupee, ListChecks, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { aiService } from '@/services'
import type { Appointment, Invoice, Patient, TreatmentPlan } from '@/types'

type AiSummary = Awaited<ReturnType<typeof aiService.generatePatientAiSummary>>

const emptySummary: AiSummary = { riskFlags: [], adherence: '', financial: '', nextAction: '' }

export function AiSummaryTab({
  patient,
  appointments,
  plans,
  invoices,
}: {
  patient: Patient
  appointments: Appointment[]
  plans: TreatmentPlan[]
  invoices: Invoice[]
}) {
  const [summary, setSummary] = useState<AiSummary>(emptySummary)
  const [generatedAt, setGeneratedAt] = useState(new Date())

  async function regenerate() {
    const next = await aiService.generatePatientAiSummary(patient, { appointments, plans, invoices })
    setSummary(next)
    setGeneratedAt(new Date())
  }

  useEffect(() => {
    regenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="accent">
          <Sparkles className="h-3 w-3" />
          Generated {generatedAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
        </Badge>
        <Button size="sm" variant="outline" onClick={regenerate}>
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="border-warning/25 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-warning">
              <AlertTriangle className="h-4 w-4" />
              Risk flags
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {summary.riskFlags.map((f) => (
              <Badge key={f} variant="warning">
                {f}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Attendance & adherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{summary.adherence}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <IndianRupee className="h-4 w-4 text-primary" />
              Financial standing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{summary.financial}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/25 bg-accent/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-primary">
              <ListChecks className="h-4 w-4" />
              Suggested next action
            </CardTitle>
            <CardDescription>What the AI would prioritize for this patient.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium leading-relaxed text-foreground">{summary.nextAction}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
