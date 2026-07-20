import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { aiService } from '@/services'

type RecommendedAction = Awaited<ReturnType<typeof aiService.recommendedActionsFor>>[number]

export function AiRecommendedActions() {
  const { role, userId } = useAuth()
  const { broadcasts, reminders, invoices, appointments, chartEntries } = useClinicStore()
  const navigate = useNavigate()
  const [actions, setActions] = useState<RecommendedAction[]>([])

  useEffect(() => {
    if (!role) {
      setActions([])
      return
    }
    const pendingBroadcasts = broadcasts.filter((b) => b.status === 'pending-approval').length
    const needingCall = reminders.filter((r) => r.status === 'no-response' || r.status === 'rescheduled').length
    const outstandingCount = invoices.filter((i) => i.status !== 'paid').length
    const unconfirmedCount = appointments.filter((a) => a.status === 'pending').length
    const aiReviewCount = chartEntries.filter(
      (c) => c.source === 'voice' && (role !== 'doctor' || c.doctorId === userId),
    ).length

    let alive = true
    aiService
      .recommendedActionsFor(role, { pendingBroadcasts, needingCall, outstandingCount, unconfirmedCount, aiReviewCount })
      .then((next) => {
        if (alive) setActions(next)
      })
    return () => {
      alive = false
    }
  }, [role, userId, broadcasts, reminders, invoices, appointments, chartEntries])

  if (actions.length === 0) return null

  return (
    <Card className="border-primary/20 bg-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          AI recommended actions
        </CardTitle>
        <CardDescription>What to prioritize right now.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{a.label}</p>
              <p className="truncate text-xs text-muted-foreground">{a.description}</p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate(a.href)}>
              Open
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
