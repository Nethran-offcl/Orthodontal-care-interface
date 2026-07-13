import { Link } from 'react-router-dom'
import { ArrowUpCircle, Bot, CheckCircle2, MessageCircle, Settings2, Sparkles, Zap } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatTile } from '@/components/shared/stat-tile'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { useClinicStore } from '@/state/store'

export function AiReceptionistPage() {
  const { conversations, patients, escalations } = useClinicStore()

  const escalatedConversationIds = new Set(escalations.map((e) => e.conversationId).filter(Boolean))
  const autoHandled = conversations.filter((c) => c.status === 'resolved' && !escalatedConversationIds.has(c.id))
  const escalatedFromAi = conversations.filter((c) => escalatedConversationIds.has(c.id))
  const resolutionRate = conversations.length
    ? Math.round((autoHandled.length / conversations.length) * 100)
    : 0

  const feed = [...conversations]
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
    .slice(0, 8)

  return (
    <div>
      <PageHeader
        title="AI Receptionist"
        description="Handles routine WhatsApp questions automatically and escalates the rest to your team."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/ai-settings">
              <Settings2 className="h-4 w-4" />
              Configure
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Conversations handled" value={conversations.length} icon={<MessageCircle className="h-4 w-4" />} />
        <StatTile label="Auto-resolved" value={autoHandled.length} icon={<Zap className="h-4 w-4" />} />
        <StatTile label="Escalated to team" value={escalatedFromAi.length} icon={<ArrowUpCircle className="h-4 w-4" />} />
        <StatTile
          label="Resolution rate"
          value={`${resolutionRate}%`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={resolutionRate >= 50 ? 'Above target' : 'Needs attention'}
          trendTone={resolutionRate >= 50 ? 'positive' : 'negative'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Recent activity
          </CardTitle>
          <CardDescription>What the assistant has been doing across every channel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {feed.length === 0 ? (
            <EmptyState icon={<Bot className="h-5 w-5" />} title="No activity yet" className="border-none" />
          ) : (
            feed.map((c) => {
              const patient = patients.find((p) => p.id === c.patientId)
              const wasEscalated = escalatedConversationIds.has(c.id)
              if (!patient) return null
              return (
                <Link
                  key={c.id}
                  to={`/messaging?channel=${c.channel}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-secondary/40"
                >
                  <PatientAvatar id={patient.id} name={patient.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{patient.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.messages[c.messages.length - 1]?.text}
                    </p>
                  </div>
                  <Badge variant={wasEscalated ? 'warning' : 'success'} className="shrink-0">
                    {wasEscalated ? (
                      <>
                        <ArrowUpCircle className="h-3 w-3" /> Escalated
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" /> Auto-handled
                      </>
                    )}
                  </Badge>
                </Link>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
