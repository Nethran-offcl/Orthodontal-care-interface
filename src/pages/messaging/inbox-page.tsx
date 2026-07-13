import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowUpCircle,
  Camera,
  History,
  Mail,
  MessageCircle,
  Paperclip,
  Search,
  Sparkles,
  StickyNote,
  ThumbsUp,
  UserPlus,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { ChatThread } from '@/components/shared/chat-thread'
import { EmptyState } from '@/components/shared/empty-state'
import { ConversationStatusBadge } from '@/components/shared/status-badge'
import { EscalateConversationDialog } from '@/pages/messaging/escalate-conversation-dialog'
import { useClinicStore } from '@/state/store'
import { doctors, receptionists, admins, getDoctor, getStaff } from '@/data'
import { suggestReply, summarizeConversation } from '@/lib/ai-mock'
import { buildPatientTimeline } from '@/lib/patient-timeline'
import { cn, formatRelativeTime, formatDate } from '@/lib/utils'
import type { ConversationChannel, ConversationStatus } from '@/data/types'

const channelMeta: Record<ConversationChannel, { label: string; icon: typeof MessageCircle; className: string }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, className: 'text-whatsapp' },
  instagram: { label: 'Instagram', icon: Camera, className: 'text-role-system' },
  facebook: { label: 'Facebook', icon: ThumbsUp, className: 'text-role-reception' },
  email: { label: 'Email', icon: Mail, className: 'text-muted-foreground' },
}

const statusTabs: { value: ConversationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
]

function slaTone(minutesWaiting: number) {
  if (minutesWaiting < 60) return 'bg-success'
  if (minutesWaiting < 120) return 'bg-warning'
  return 'bg-destructive'
}

function chipClass(active: boolean) {
  return cn(
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
    active ? 'border-primary bg-accent text-accent-foreground' : 'border-border text-muted-foreground hover:bg-secondary/60',
  )
}

export function InboxPage() {
  const {
    conversations,
    patients,
    appointments,
    chartEntries,
    images,
    prescriptions,
    invoices,
    sendMessage,
    markConversationRead,
    assignConversation,
    updateConversationStatus,
    addInternalNote,
    addAttachment,
  } = useClinicStore()
  const [searchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState<ConversationChannel | 'all'>(() => {
    const c = searchParams.get('channel')
    return c === 'whatsapp' || c === 'instagram' || c === 'facebook' || c === 'email' ? c : 'all'
  })
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all')
  const [detailTab, setDetailTab] = useState('chat')
  const [draft, setDraft] = useState('')
  const [noteText, setNoteText] = useState('')
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [summary, setSummary] = useState<string[] | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...conversations]
      .filter((c) => channelFilter === 'all' || c.channel === channelFilter)
      .filter((c) => statusFilter === 'all' || c.status === statusFilter)
      .filter((c) => {
        if (!q) return true
        const patient = patients.find((p) => p.id === c.patientId)
        return patient?.name.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q))
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
  }, [conversations, patients, channelFilter, statusFilter, query])

  useEffect(() => {
    if ((!selectedId || !filtered.some((c) => c.id === selectedId)) && filtered.length > 0) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = conversations.find((c) => c.id === selectedId)
  const selectedPatient = selected ? patients.find((p) => p.id === selected.patientId) : undefined

  function assigneeName(id?: string) {
    if (!id) return undefined
    return getDoctor(id)?.name ?? getStaff(id)?.name
  }

  function handleAiReply() {
    if (!selected || !selectedPatient) return
    setDraft(suggestReply(selected, selectedPatient.name))
  }

  function handleSummarize() {
    if (!selected || !selectedPatient) return
    setSummary(summarizeConversation(selected, selectedPatient.name))
  }

  function handleAddNote() {
    if (!selected || !noteText.trim()) return
    addInternalNote(selected.id, 'Priya Kulkarni', noteText.trim())
    setNoteText('')
  }

  function handleAttach() {
    if (!selected) return
    const names = ['x-ray-scan.jpg', 'insurance-card.pdf', 'payment-receipt.pdf', 'voice-memo.mp3']
    const name = names[Math.floor(Math.random() * names.length)]
    addAttachment(selected.id, {
      name,
      kind: name.endsWith('.mp3') ? 'audio' : name.endsWith('.pdf') ? 'document' : 'image',
      sizeKb: Math.floor(80 + Math.random() * 900),
    })
  }

  const allAssignees = [
    ...doctors.map((d) => ({ id: d.id, name: d.name, role: 'Doctor' })),
    ...receptionists.map((r) => ({ id: r.id, name: r.name, role: 'Receptionist' })),
    ...admins.map((a) => ({ id: a.id, name: a.name, role: 'Administrator' })),
  ]

  const timeline = selected ? buildPatientTimeline(selected.patientId, { appointments, chartEntries, images, prescriptions, invoices, conversations }) : []

  return (
    <Card className="h-[calc(100vh-220px)] min-h-[560px] overflow-hidden">
      <div className="grid h-full grid-cols-1 sm:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <div className="flex flex-col border-r border-border">
          <div className="space-y-2.5 border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                className="h-8 pl-8 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setChannelFilter('all')} className={chipClass(channelFilter === 'all')}>
                All channels
              </button>
              {(Object.keys(channelMeta) as ConversationChannel[]).map((ch) => {
                const meta = channelMeta[ch]
                return (
                  <button key={ch} onClick={() => setChannelFilter(ch)} className={chipClass(channelFilter === ch)}>
                    <meta.icon className="h-3 w-3" />
                    {meta.label}
                  </button>
                )
              })}
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ConversationStatus | 'all')}>
              <TabsList className="h-8 w-full">
                {statusTabs.map((t) => (
                  <TabsTrigger key={t.value} value={t.value} className="flex-1 px-1 text-[11px]">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <EmptyState icon={<MessageCircle className="h-5 w-5" />} title="No conversations match" className="border-none" />
            ) : (
              filtered.map((c) => {
                const patient = patients.find((p) => p.id === c.patientId)
                if (!patient) return null
                const meta = channelMeta[c.channel]
                const lastMsg = c.messages[c.messages.length - 1]
                const waitingOnClinic = lastMsg?.sender === 'patient'
                const minutesWaiting = waitingOnClinic
                  ? Math.round((Date.now() - new Date(lastMsg.time).getTime()) / 60000)
                  : 0
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedId(c.id)
                      markConversationRead(c.patientId)
                      setSummary(null)
                      setDetailTab('chat')
                    }}
                    className={cn(
                      'flex w-full items-start gap-2.5 border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-secondary/50',
                      selectedId === c.id && 'bg-secondary',
                    )}
                  >
                    <PatientAvatar id={patient.id} name={patient.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-sm font-medium">{patient.name}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{formatRelativeTime(c.lastMessageAt)}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {lastMsg?.sender === 'clinic' ? 'You: ' : ''}
                        {lastMsg?.text}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <meta.icon className={cn('h-3 w-3', meta.className)} />
                        <ConversationStatusBadge status={c.status} />
                        {c.assigneeId && (
                          <span className="truncate text-[10px] text-muted-foreground">· {assigneeName(c.assigneeId)}</span>
                        )}
                      </div>
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

        {/* Detail panel */}
        <div className="hidden flex-col overflow-hidden sm:flex">
          {selected && selectedPatient ? (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
                <PatientAvatar id={selectedPatient.id} name={selectedPatient.name} />
                <div className="min-w-0 flex-1">
                  <Link to={`/patients/${selectedPatient.id}`} className="text-sm font-semibold hover:underline">
                    {selectedPatient.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {selectedPatient.phone} · {channelMeta[selected.channel].label}
                  </p>
                </div>
                <Select value={selected.status} onValueChange={(v) => updateConversationStatus(selected.id, v as ConversationStatus)}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-3.5 w-3.5" />
                      {assigneeName(selected.assigneeId) ?? 'Assign'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allAssignees.map((a) => (
                      <DropdownMenuItem key={a.id} onSelect={() => assignConversation(selected.id, a.id)}>
                        {a.name}
                        <span className="ml-auto text-xs text-muted-foreground">{a.role}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" onClick={() => setEscalateOpen(true)}>
                  <ArrowUpCircle className="h-3.5 w-3.5" />
                  Escalate
                </Button>
                <Popover onOpenChange={(o) => o && handleSummarize()}>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Sparkles className="h-3.5 w-3.5" />
                      Summarize
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Sparkles className="h-3 w-3" /> AI summary
                    </p>
                    {summary ? (
                      <ul className="space-y-1.5 text-xs leading-relaxed text-foreground">
                        {summary.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">Generating…</p>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab} className="flex flex-1 flex-col overflow-hidden">
                <TabsList className="mx-3 mt-2 w-fit">
                  <TabsTrigger value="chat">Conversation</TabsTrigger>
                  <TabsTrigger value="notes">
                    Internal Notes{selected.internalNotes.length > 0 && ` (${selected.internalNotes.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="attachments">
                    Attachments{selected.attachments.length > 0 && ` (${selected.attachments.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="timeline">Patient timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex flex-1 flex-col overflow-hidden p-3">
                  <div className="mb-2 flex justify-end gap-1.5">
                    <Button size="sm" variant="outline" onClick={handleAiReply}>
                      <Sparkles className="h-3.5 w-3.5" />
                      AI suggested reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleAttach}>
                      <Paperclip className="h-3.5 w-3.5" />
                      Attach
                    </Button>
                  </div>
                  <ChatThread
                    conversation={selected}
                    onSend={(text) => {
                      sendMessage(selectedPatient.id, text)
                      setDraft('')
                    }}
                    draft={draft}
                    onDraftChange={setDraft}
                  />
                </TabsContent>

                <TabsContent value="notes" className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                  <div className="space-y-3">
                    {selected.internalNotes.length === 0 ? (
                      <EmptyState icon={<StickyNote className="h-5 w-5" />} title="No internal notes yet" className="border-none py-8" />
                    ) : (
                      selected.internalNotes.map((n) => (
                        <div key={n.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium">{n.author}</span>
                            <span className="text-muted-foreground">{formatRelativeTime(n.time)}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{n.text}</p>
                        </div>
                      ))
                    )}
                    <div className="flex items-start gap-2 pt-1">
                      <Textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note only staff can see…"
                        rows={2}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
                        Add
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                  {selected.attachments.length === 0 ? (
                    <EmptyState icon={<Paperclip className="h-5 w-5" />} title="No attachments yet" description="Use Attach in the conversation tab to add one." className="border-none py-8" />
                  ) : (
                    <div className="space-y-2">
                      {selected.attachments.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
                          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.sizeKb} KB · {formatRelativeTime(a.time)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                  {timeline.length === 0 ? (
                    <EmptyState icon={<History className="h-5 w-5" />} title="No activity yet" className="border-none py-8" />
                  ) : (
                    <div className="space-y-1">
                      {timeline.slice(0, 12).map((ev) => (
                        <Link
                          key={ev.id}
                          to={ev.href}
                          className="flex items-start justify-between gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-secondary/40"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{ev.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{ev.description}</p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">{formatDate(ev.date, { day: 'numeric', month: 'short' })}</span>
                        </Link>
                      ))}
                      <Link to={`/patients/${selectedPatient.id}?tab=timeline`} className="mt-2 block text-center text-xs text-primary hover:underline">
                        View full patient profile
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <EmptyState icon={<MessageCircle className="h-5 w-5" />} title="Select a conversation" className="border-none" />
          )}
        </div>
      </div>

      {selected && (
        <EscalateConversationDialog
          open={escalateOpen}
          onOpenChange={setEscalateOpen}
          conversationId={selected.id}
          patientId={selected.patientId}
        />
      )}
    </Card>
  )
}
