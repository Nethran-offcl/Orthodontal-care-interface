import { supabase } from '@/lib/supabase'
import type { Attachment, ChatMessage, Conversation, ConversationStatus, InternalNote } from '@/types'

interface ConversationRow {
  id: string
  patient_id: string
  last_message_at: string
  unread: number
  sla_minutes: number
  channel: Conversation['channel']
  status: ConversationStatus
  assignee_id: string | null
  priority: Conversation['priority'] | null
}

interface ChatMessageRow {
  id: string
  conversation_id: string
  sender: ChatMessage['sender']
  text: string
  time: string
  status: ChatMessage['status'] | null
}

interface InternalNoteRow {
  id: string
  conversation_id: string
  author: string
  text: string
  time: string
}

interface AttachmentRow {
  id: string
  conversation_id: string
  name: string
  kind: Attachment['kind']
  size_kb: number
  time: string
}

function messageFromRow(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    sender: row.sender,
    text: row.text,
    time: row.time,
    status: row.status ?? undefined,
  }
}

function noteFromRow(row: InternalNoteRow): InternalNote {
  return { id: row.id, author: row.author, text: row.text, time: row.time }
}

function attachmentFromRow(row: AttachmentRow): Attachment {
  return { id: row.id, name: row.name, kind: row.kind, sizeKb: row.size_kb, time: row.time }
}

function composeConversation(
  row: ConversationRow,
  messages: ChatMessageRow[],
  notes: InternalNoteRow[],
  attachments: AttachmentRow[],
): Conversation {
  return {
    id: row.id,
    patientId: row.patient_id,
    lastMessageAt: row.last_message_at,
    unread: row.unread,
    slaMinutes: row.sla_minutes,
    channel: row.channel,
    status: row.status,
    assigneeId: row.assignee_id ?? undefined,
    priority: row.priority ?? undefined,
    messages: messages.filter((m) => m.conversation_id === row.id).map(messageFromRow),
    internalNotes: notes.filter((n) => n.conversation_id === row.id).map(noteFromRow),
    attachments: attachments.filter((a) => a.conversation_id === row.id).map(attachmentFromRow),
  }
}

async function fetchAllConversations(): Promise<Conversation[]> {
  const [{ data: conversations, error: convError }, { data: messages, error: msgError }, { data: notes, error: noteError }, { data: attachments, error: attError }] =
    await Promise.all([
      supabase.from('conversations').select('*').order('last_message_at', { ascending: false }),
      supabase.from('chat_messages').select('*').order('time'),
      supabase.from('internal_notes').select('*').order('time'),
      supabase.from('attachments').select('*').order('time'),
    ])
  if (convError) throw convError
  if (msgError) throw msgError
  if (noteError) throw noteError
  if (attError) throw attError
  return (conversations as ConversationRow[]).map((c) =>
    composeConversation(c, messages as ChatMessageRow[], notes as InternalNoteRow[], attachments as AttachmentRow[]),
  )
}

const demoAttachmentNames = ['x-ray-scan.jpg', 'insurance-card.pdf', 'payment-receipt.pdf', 'voice-memo.mp3']

/**
 * Stands in for a real file picker/upload — invents a plausible demo attachment
 * so the inbox's "attach" button has something to send.
 */
export function pickRandomDemoAttachment(): Omit<Attachment, 'id' | 'time'> {
  const name = demoAttachmentNames[Math.floor(Math.random() * demoAttachmentNames.length)]
  return {
    name,
    kind: name.endsWith('.mp3') ? 'audio' : name.endsWith('.pdf') ? 'document' : 'image',
    sizeKb: Math.floor(80 + Math.random() * 900),
  }
}

export const chatService = {
  async getAll(): Promise<Conversation[]> {
    return fetchAllConversations()
  },

  async sendMessage(patientId: string, text: string) {
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle()
    if (findError) throw findError

    const now = new Date().toISOString()
    let conversationId = existing?.id as string | undefined

    if (!conversationId) {
      const { data: created, error: createError } = await supabase
        .from('conversations')
        .insert({ patient_id: patientId, last_message_at: now, unread: 0, sla_minutes: 0, channel: 'whatsapp', status: 'open' })
        .select()
        .single()
      if (createError) throw createError
      conversationId = created.id as string
    } else {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_at: now })
        .eq('id', conversationId)
      if (updateError) throw updateError
    }

    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: conversationId, sender: 'clinic', text, time: now, status: 'sent' })
    if (insertError) throw insertError

    const conversations = await fetchAllConversations()
    return conversations.find((c) => c.id === conversationId)!
  },

  async markRead(patientId: string) {
    const { error } = await supabase.from('conversations').update({ unread: 0 }).eq('patient_id', patientId)
    if (error) throw error
  },

  /** Manual dev helper simulating an inbound reply — replaced by a real WhatsApp webhook later. */
  async simulateReply(patientId: string, text: string) {
    const { data: conversation, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle()
    if (findError) throw findError
    if (!conversation) return undefined

    const now = new Date().toISOString()
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: conversation.id, sender: 'patient', text, time: now })
    if (insertError) throw insertError

    const { error: updateError } = await supabase
      .from('conversations')
      .update({ last_message_at: now, unread: (conversation as ConversationRow).unread + 1 })
      .eq('id', conversation.id)
    if (updateError) throw updateError

    const conversations = await fetchAllConversations()
    return conversations.find((c) => c.id === conversation.id)
  },

  async assign(id: string, assigneeId: string) {
    const { data, error } = await supabase.from('conversations').update({ assignee_id: assigneeId }).eq('id', id).select().single()
    if (error) throw error
    const conversations = await fetchAllConversations()
    return conversations.find((c) => c.id === data.id)!
  },

  async updateStatus(id: string, status: ConversationStatus) {
    const { data, error } = await supabase.from('conversations').update({ status }).eq('id', id).select().single()
    if (error) throw error
    const conversations = await fetchAllConversations()
    return conversations.find((c) => c.id === data.id)!
  },

  async addInternalNote(id: string, author: string, text: string) {
    const { data, error } = await supabase
      .from('internal_notes')
      .insert({ conversation_id: id, author, text, time: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return noteFromRow(data as InternalNoteRow)
  },

  async addAttachment(id: string, attachment: Omit<Attachment, 'id' | 'time'>) {
    const { data, error } = await supabase
      .from('attachments')
      .insert({ conversation_id: id, name: attachment.name, kind: attachment.kind, size_kb: attachment.sizeKb, time: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return attachmentFromRow(data as AttachmentRow)
  },

  /** Live updates for one conversation's messages via Supabase Realtime. Call the returned function to unsubscribe. */
  subscribeToConversation(conversationId: string, onMessage: (message: ChatMessage) => void) {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => onMessage(messageFromRow(payload.new as ChatMessageRow)),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
