import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Stethoscope } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { ChatThread } from '@/components/shared/chat-thread'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/layout/page-header'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { cn, formatRelativeTime } from '@/lib/utils'

function slaTone(minutesWaiting: number) {
  if (minutesWaiting < 60) return 'bg-success'
  if (minutesWaiting < 120) return 'bg-warning'
  return 'bg-destructive'
}

export function InboxPage() {
  const { role, currentPatientId } = useAppState()
  const { conversations, patients, sendMessage, markConversationRead } = useClinicStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    [conversations],
  )

  useEffect(() => {
    if (!selectedId && sorted.length > 0 && role !== 'patient') setSelectedId(sorted[0].patientId)
  }, [sorted, selectedId, role])

  if (role === 'patient') {
    const myConversation = conversations.find((c) => c.patientId === currentPatientId)
    return (
      <div>
        <PageHeader title="Messages" description="Your conversation with Sunrise Dental." />
        <Card className="h-[560px]">
          <CardContent className="flex h-full flex-col gap-3 p-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Sunrise Dental</p>
                <p className="text-xs text-muted-foreground">Usually replies within 2 hours</p>
              </div>
            </div>
            <ChatThread
              conversation={myConversation}
              onSend={(text) => sendMessage(currentPatientId, text)}
              placeholder="Message the clinic…"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const selected = conversations.find((c) => c.patientId === selectedId)
  const selectedPatient = selected ? patients.find((p) => p.id === selected.patientId) : undefined

  return (
    <Card className="h-[calc(100vh-220px)] min-h-[480px] overflow-hidden">
      <div className="grid h-full grid-cols-1 sm:grid-cols-[280px_1fr]">
        <div className="flex flex-col border-r border-border">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Conversations</p>
            <p className="text-xs text-muted-foreground">{sorted.length} patient threads</p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {sorted.length === 0 ? (
              <EmptyState icon={<MessageCircle className="h-5 w-5" />} title="No conversations yet" className="border-none" />
            ) : (
              sorted.map((c) => {
                const patient = patients.find((p) => p.id === c.patientId)
                if (!patient) return null
                const lastMsg = c.messages[c.messages.length - 1]
                const waitingOnClinic = lastMsg?.sender === 'patient'
                const minutesWaiting = waitingOnClinic
                  ? Math.round((Date.now() - new Date(lastMsg.time).getTime()) / 60000)
                  : 0

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedId(c.patientId)
                      markConversationRead(c.patientId)
                    }}
                    className={cn(
                      'flex w-full items-start gap-2.5 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-secondary/50',
                      selectedId === c.patientId && 'bg-secondary',
                    )}
                  >
                    <PatientAvatar id={patient.id} name={patient.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-sm font-medium">{patient.name}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatRelativeTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {lastMsg?.sender === 'clinic' ? 'You: ' : ''}
                        {lastMsg?.text}
                      </p>
                    </div>
                    <div className="mt-1 flex shrink-0 flex-col items-end gap-1">
                      {c.unread > 0 && (
                        <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold text-primary-foreground">
                          {c.unread}
                        </span>
                      )}
                      {waitingOnClinic && <span className={cn('h-1.5 w-1.5 rounded-full', slaTone(minutesWaiting))} />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="hidden flex-col p-4 sm:flex">
          {selected && selectedPatient ? (
            <>
              <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
                <PatientAvatar id={selectedPatient.id} name={selectedPatient.name} />
                <div>
                  <p className="text-sm font-semibold">{selectedPatient.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedPatient.phone}</p>
                </div>
              </div>
              <ChatThread conversation={selected} onSend={(text) => sendMessage(selectedPatient.id, text)} />
            </>
          ) : (
            <EmptyState icon={<MessageCircle className="h-5 w-5" />} title="Select a conversation" className="border-none" />
          )}
        </div>
      </div>
    </Card>
  )
}
