import { useState } from 'react'
import { ArrowUpCircle, History, MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ExpandableCard } from '@/components/shared/expandable-card'
import { EmptyState } from '@/components/shared/empty-state'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { EscalationPriorityBadge, EscalationStatusBadge } from '@/components/shared/status-badge'
import { NewEscalationDialog } from '@/pages/messaging/new-escalation-dialog'
import { useClinicStore } from '@/state/store'
import { useAuth } from '@/state/auth-state'
import { formatRelativeTime } from '@/lib/utils'
import type { Doctor, EscalationStatus, StaffMember } from '@/types'

function assigneeName(id: string | undefined, doctors: Doctor[], staff: StaffMember[]) {
  if (!id) return 'Unassigned'
  return doctors.find((d) => d.id === id)?.name ?? staff.find((s) => s.id === id)?.name ?? 'Unassigned'
}

function currentActorName(role: string | null, userId: string | null, doctors: Doctor[], staff: StaffMember[]) {
  if (role === 'doctor') return doctors.find((d) => d.id === userId)?.name ?? 'Staff'
  return staff.find((s) => s.id === userId)?.name ?? 'Staff'
}

export function EscalationsPage() {
  const { escalations, patients, doctors, staff, addEscalationComment, updateEscalationStatus } = useClinicStore()
  const { role, userId } = useAuth()
  const [newOpen, setNewOpen] = useState(false)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const sorted = [...escalations].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const actor = currentActorName(role, userId, doctors, staff)

  function submitComment(id: string) {
    const text = (commentDrafts[id] ?? '').trim()
    if (!text) return
    addEscalationComment(id, actor, text)
    setCommentDrafts((d) => ({ ...d, [id]: '' }))
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Routed conversations and clinical/admin items needing another set of eyes.</p>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4" />
          New escalation
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={<ArrowUpCircle className="h-5 w-5" />} title="No escalations" description="Nothing has been routed for review." />
      ) : (
        <div className="space-y-3">
          {sorted.map((esc) => {
            const patient = patients.find((p) => p.id === esc.patientId)
            return (
              <ExpandableCard
                key={esc.id}
                header={
                  <div className="flex flex-wrap items-center gap-2">
                    {patient && <PatientAvatar id={patient.id} name={patient.name} size="sm" />}
                    <span className="text-sm font-semibold">{patient?.name ?? esc.patientId}</span>
                    <EscalationPriorityBadge priority={esc.priority} />
                    <EscalationStatusBadge status={esc.status} />
                    <span className="ml-auto text-xs text-muted-foreground">{formatRelativeTime(esc.createdAt)}</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed">{esc.reason}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Assigned to <span className="font-medium text-foreground">{assigneeName(esc.assignedToId, doctors, staff)}</span></span>
                    <span>·</span>
                    <span>Created by {esc.createdBy}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(['open', 'in-progress', 'resolved'] as EscalationStatus[]).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={esc.status === s ? 'default' : 'outline'}
                        onClick={() => updateEscalationStatus(esc.id, s, actor)}
                        disabled={esc.status === s}
                      >
                        Mark {s.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> Comments
                    </p>
                    <div className="space-y-2">
                      {esc.comments.map((c) => (
                        <div key={c.id} className="rounded-lg border border-border bg-secondary/30 p-2.5 text-sm">
                          <div className="mb-0.5 flex items-center justify-between text-xs">
                            <span className="font-medium">{c.author}</span>
                            <span className="text-muted-foreground">{formatRelativeTime(c.time)}</span>
                          </div>
                          {c.text}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <Textarea
                        value={commentDrafts[esc.id] ?? ''}
                        onChange={(e) => setCommentDrafts((d) => ({ ...d, [esc.id]: e.target.value }))}
                        placeholder="Add a comment…"
                        rows={2}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={() => submitComment(esc.id)} disabled={!(commentDrafts[esc.id] ?? '').trim()}>
                        Post
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <History className="h-3 w-3" /> History
                    </p>
                    <div className="space-y-1.5">
                      {esc.history.map((h) => (
                        <div key={h.id} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            <span className="font-medium text-foreground">{h.actor}</span> — {h.action}
                          </span>
                          <span>{formatRelativeTime(h.time)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ExpandableCard>
            )
          })}
        </div>
      )}

      <NewEscalationDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}
