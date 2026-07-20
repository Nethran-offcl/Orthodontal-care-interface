import { createCrudService, nextId } from './types'
import { conversations as seedConversations } from '@/mocks'
import type { Attachment, Conversation, ConversationStatus, InternalNote } from '@/types'

const base = createCrudService<Conversation>(seedConversations, 'CV', (c, q) =>
  c.patientId.toLowerCase().includes(q) ||
  c.channel.toLowerCase().includes(q) ||
  c.status.toLowerCase().includes(q) ||
  c.messages.some((m) => m.text.toLowerCase().includes(q)),
)

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
  ...base,
  async sendMessage(patientId: string, text: string) {
    const conversations = base._all()
    const existing = conversations.find((c) => c.patientId === patientId)
    const message = {
      id: nextId('m'),
      sender: 'clinic' as const,
      text,
      time: new Date().toISOString(),
      status: 'sent' as const,
    }
    if (existing) {
      const next = conversations.map((c) =>
        c.patientId === patientId
          ? { ...c, messages: [...c.messages, message], lastMessageAt: message.time }
          : c,
      )
      base._set(next)
      return next.find((c) => c.patientId === patientId)!
    }
    const newConversation: Conversation = {
      id: nextId('CV'),
      patientId,
      messages: [message],
      lastMessageAt: message.time,
      unread: 0,
      slaMinutes: 0,
      channel: 'whatsapp',
      status: 'open',
      internalNotes: [],
      attachments: [],
    }
    base._set([...conversations, newConversation])
    return newConversation
  },
  async markRead(patientId: string) {
    base._set(base._all().map((c) => (c.patientId === patientId ? { ...c, unread: 0 } : c)))
  },
  async simulateReply(patientId: string, text: string) {
    const next = base._all().map((c) =>
      c.patientId === patientId
        ? {
            ...c,
            messages: [
              ...c.messages,
              { id: nextId('m'), sender: 'patient' as const, text, time: new Date().toISOString() },
            ],
            lastMessageAt: new Date().toISOString(),
            unread: c.unread + 1,
          }
        : c,
    )
    base._set(next)
    return next.find((c) => c.patientId === patientId)
  },
  async assign(id: string, assigneeId: string) {
    return base.update(id, { assigneeId } as Partial<Conversation>)
  },
  async updateStatus(id: string, status: ConversationStatus) {
    return base.update(id, { status } as Partial<Conversation>)
  },
  async addInternalNote(id: string, author: string, text: string) {
    const note: InternalNote = { id: nextId('IN'), author, text, time: new Date().toISOString() }
    const next = base._all().map((c) => (c.id === id ? { ...c, internalNotes: [...c.internalNotes, note] } : c))
    base._set(next)
    return note
  },
  async addAttachment(id: string, attachment: Omit<Attachment, 'id' | 'time'>) {
    const newAttachment: Attachment = { ...attachment, id: nextId('AT'), time: new Date().toISOString() }
    const next = base._all().map((c) =>
      c.id === id ? { ...c, attachments: [...c.attachments, newAttachment] } : c,
    )
    base._set(next)
    return newAttachment
  },
}
