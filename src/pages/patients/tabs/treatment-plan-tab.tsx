import { useState } from 'react'
import { toast } from 'sonner'
import { ClipboardList, ClipboardPlus, IndianRupee, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { StageStatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { NewTreatmentPlanDialog } from '@/pages/patients/new-treatment-plan-dialog'
import { AddStageDialog } from '@/pages/patients/add-stage-dialog'
import { useClinicStore } from '@/state/store'
import { useAppState } from '@/state/app-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TreatmentPlan } from '@/data/types'

export function TreatmentPlanTab({ patientId, plans }: { patientId: string; plans: TreatmentPlan[] }) {
  const { role } = useAppState()
  const { updateStageStatus } = useClinicStore()
  const [newPlanOpen, setNewPlanOpen] = useState(false)
  const [addStagePlanId, setAddStagePlanId] = useState<string | null>(null)
  const canEdit = role !== 'patient'

  const sorted = [...plans].sort((a) => (a.status === 'active' ? -1 : 1))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Drives follow-up reminders automatically — no manual tracking needed.
        </p>
        {canEdit && (
          <Button size="sm" onClick={() => setNewPlanOpen(true)}>
            <ClipboardPlus className="h-4 w-4" />
            New treatment plan
          </Button>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title="No treatment plan yet"
          description="Create one to track multi-visit procedures and automate follow-ups."
        />
      ) : (
        <div className="space-y-5">
          {sorted.map((plan) => {
            const total = plan.stages.reduce((s, st) => s + st.cost, 0)
            const completed = plan.stages.filter((s) => s.status === 'completed').length
            const pct = Math.round((completed / plan.stages.length) * 100)

            return (
              <Card key={plan.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{plan.title}</CardTitle>
                      <Badge variant={plan.status === 'active' ? 'accent' : 'success'}>
                        {plan.status === 'active' ? 'Active' : 'Completed'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created {formatDate(plan.createdOn)} · {completed}/{plan.stages.length} stages complete
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold tabular">
                    <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                    {total.toLocaleString('en-IN')}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={pct} />
                  <div className="space-y-2">
                    {plan.stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{stage.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Target {formatDate(stage.targetDate, { day: 'numeric', month: 'short' })} · {formatCurrency(stage.cost)}
                          </p>
                          {stage.notes && <p className="mt-1 text-xs italic text-muted-foreground">{stage.notes}</p>}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StageStatusBadge status={stage.status} />
                          {canEdit && stage.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const next = stage.status === 'planned' ? 'in-progress' : 'completed'
                                updateStageStatus(plan.id, stage.id, next)
                                toast.success(next === 'completed' ? 'Stage marked complete' : 'Stage marked in progress')
                              }}
                            >
                              {stage.status === 'planned' ? 'Start' : 'Complete'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {canEdit && (
                    <Button variant="ghost" size="sm" onClick={() => setAddStagePlanId(plan.id)}>
                      <Plus className="h-3.5 w-3.5" />
                      Add stage
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <NewTreatmentPlanDialog patientId={patientId} open={newPlanOpen} onOpenChange={setNewPlanOpen} />
      {addStagePlanId && (
        <AddStageDialog
          planId={addStagePlanId}
          open={!!addStagePlanId}
          onOpenChange={(o) => !o && setAddStagePlanId(null)}
        />
      )}
    </div>
  )
}
