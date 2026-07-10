import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, Megaphone, Send, ThumbsDown, Users, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BroadcastStatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { BroadcastComposerDialog } from '@/pages/messaging/broadcast-composer-dialog'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Broadcast } from '@/data/types'

export function BroadcastsPage() {
  const { role } = useAppState()
  const { broadcasts, approveBroadcast, rejectBroadcast, sendBroadcastNow } = useClinicStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [composerOpen, setComposerOpen] = useState(false)
  const [rejecting, setRejecting] = useState<Broadcast | null>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setComposerOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sorted = [...broadcasts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function handleReject() {
    if (!rejecting) return
    if (!reason.trim()) {
      toast.error('Add a short note so the front desk knows why.')
      return
    }
    rejectBroadcast(rejecting.id, reason)
    toast('Broadcast rejected')
    setRejecting(null)
    setReason('')
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Personalized WhatsApp announcements — always doctor-approved before sending.</p>
        <Button onClick={() => setComposerOpen(true)}>
          <Megaphone className="h-4 w-4" />
          New broadcast
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={<Megaphone className="h-5 w-5" />} title="No broadcasts yet" />
      ) : (
        <div className="space-y-3">
          {sorted.map((bc) => (
            <Card key={bc.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{bc.title}</CardTitle>
                    <BroadcastStatusBadge status={bc.status} />
                  </div>
                  <CardDescription className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> {bc.audience} ({bc.audienceCount}) · {formatDate(bc.createdAt)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="rounded-lg bg-secondary/50 p-3 text-sm leading-relaxed">{bc.message}</p>

                {bc.status === 'rejected' && bc.reviewNote && (
                  <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
                    <span className="font-medium">Doctor's note: </span>
                    {bc.reviewNote}
                  </div>
                )}

                {bc.status === 'sent' && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Sent {formatRelativeTime(bc.sentAt ?? bc.createdAt)}</span>
                    <span>{bc.deliveredCount} delivered</span>
                    <span>{bc.readCount} read</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {bc.status === 'pending-approval' && role === 'doctor' && (
                    <>
                      <Button size="sm" onClick={() => { approveBroadcast(bc.id); toast.success('Broadcast approved') }}>
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejecting(bc)}>
                        <ThumbsDown className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  )}
                  {bc.status === 'pending-approval' && role !== 'doctor' && (
                    <p className="text-xs text-muted-foreground">Waiting for doctor review before it can send.</p>
                  )}
                  {bc.status === 'approved' && role !== 'doctor' && (
                    <Button size="sm" onClick={() => { sendBroadcastNow(bc.id); toast.success('Broadcast sent') }}>
                      <Send className="h-3.5 w-3.5" />
                      Send now
                    </Button>
                  )}
                  {bc.status === 'draft' && (
                    <p className="text-xs text-muted-foreground">Draft — not yet submitted for approval.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BroadcastComposerDialog open={composerOpen} onOpenChange={setComposerOpen} />

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Reject broadcast
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let the front desk know why, so they can revise it…"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
