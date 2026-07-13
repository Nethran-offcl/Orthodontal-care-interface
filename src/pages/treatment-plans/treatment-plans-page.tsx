import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, IndianRupee, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { generateTreatmentSummary } from '@/lib/ai-mock'
import { formatDate } from '@/lib/utils'
import type { TreatmentPlan } from '@/data/types'

export function TreatmentPlansPage() {
  const { role, userId } = useAuth()
  const { treatmentPlans, patients } = useClinicStore()
  const [summaries, setSummaries] = useState<Record<string, string>>({})

  const scoped = role === 'doctor' && userId ? treatmentPlans.filter((t) => t.createdByDoctorId === userId) : treatmentPlans

  const active = scoped.filter((t) => t.status === 'active')
  const completed = scoped.filter((t) => t.status === 'completed')

  function handleSummarize(plan: TreatmentPlan) {
    const patient = patients.find((p) => p.id === plan.patientId)
    if (!patient) return
    setSummaries((s) => ({ ...s, [plan.id]: generateTreatmentSummary(plan, patient) }))
  }

  function renderPlan(plan: TreatmentPlan) {
    const patient = patients.find((p) => p.id === plan.patientId)
    const total = plan.stages.reduce((s, st) => s + st.cost, 0)
    const doneCount = plan.stages.filter((s) => s.status === 'completed').length
    const pct = Math.round((doneCount / plan.stages.length) * 100)

    return (
      <Card key={plan.id}>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3">
            {patient && <PatientAvatar id={patient.id} name={patient.name} />}
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{plan.title}</CardTitle>
                <Badge variant={plan.status === 'active' ? 'accent' : 'success'}>
                  {plan.status === 'active' ? 'Active' : 'Completed'}
                </Badge>
              </div>
              <CardDescription>
                {patient ? (
                  <Link to={`/patients/${patient.id}?tab=plan`} className="hover:underline">
                    {patient.name}
                  </Link>
                ) : (
                  'Unknown patient'
                )}{' '}
                · Created {formatDate(plan.createdOn)} · {doneCount}/{plan.stages.length} stages complete
              </CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold tabular">
            <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
            {total.toLocaleString('en-IN')}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={pct} />
          <Button size="sm" variant="outline" onClick={() => handleSummarize(plan)}>
            <Sparkles className="h-3.5 w-3.5" />
            AI summary
          </Button>
          {summaries[plan.id] && (
            <p className="rounded-lg border border-primary/20 bg-accent/40 p-3 text-sm leading-relaxed text-foreground">
              {summaries[plan.id]}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader title="Treatment plans" description={`${scoped.length} plans across your patients`} />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3">
          {active.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="No active treatment plans" />
          ) : (
            active.map(renderPlan)
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-3">
          {completed.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="No completed treatment plans yet" />
          ) : (
            completed.map(renderPlan)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
