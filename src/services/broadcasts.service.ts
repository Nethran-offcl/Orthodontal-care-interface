import { supabase } from '@/lib/supabase'
import type { Broadcast, BroadcastStatus } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface BroadcastRow {
  id: string
  title: string
  message: string
  audience: string
  audience_count: number
  status: BroadcastStatus
  created_by: string
  created_at: string
  scheduled_for: string | null
  sent_at: string | null
  delivered_count: number | null
  read_count: number | null
  review_note: string | null
}

function fromRow(row: BroadcastRow): Broadcast {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    audience: row.audience,
    audienceCount: row.audience_count,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    scheduledFor: row.scheduled_for ?? undefined,
    sentAt: row.sent_at ?? undefined,
    deliveredCount: row.delivered_count ?? undefined,
    readCount: row.read_count ?? undefined,
    reviewNote: row.review_note ?? undefined,
  }
}

function toRow(bc: Partial<Broadcast>): Partial<BroadcastRow> {
  const row: Partial<BroadcastRow> = {}
  if (bc.title !== undefined) row.title = bc.title
  if (bc.message !== undefined) row.message = bc.message
  if (bc.audience !== undefined) row.audience = bc.audience
  if (bc.audienceCount !== undefined) row.audience_count = bc.audienceCount
  if (bc.status !== undefined) row.status = bc.status
  if (bc.createdBy !== undefined) row.created_by = bc.createdBy
  if (bc.createdAt !== undefined) row.created_at = bc.createdAt
  if (bc.scheduledFor !== undefined) row.scheduled_for = bc.scheduledFor
  if (bc.sentAt !== undefined) row.sent_at = bc.sentAt
  if (bc.deliveredCount !== undefined) row.delivered_count = bc.deliveredCount
  if (bc.readCount !== undefined) row.read_count = bc.readCount
  if (bc.reviewNote !== undefined) row.review_note = bc.reviewNote
  return row
}

async function setStatus(id: string, status: BroadcastStatus, extra?: Partial<Broadcast>) {
  return broadcastsService.update(id, { status, ...extra })
}

export const broadcastsService = {
  async getAll(): Promise<Broadcast[]> {
    const { data, error } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data as BroadcastRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Broadcast | undefined> {
    const { data, error } = await supabase.from('broadcasts').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as BroadcastRow) : undefined
  },

  async create(input: Omit<Broadcast, 'id' | 'status' | 'createdAt'>): Promise<Broadcast> {
    const { data, error } = await supabase
      .from('broadcasts')
      .insert(toRow({ ...input, status: 'draft', createdAt: new Date().toISOString() }))
      .select()
      .single()
    if (error) throw error
    return fromRow(data as BroadcastRow)
  },

  async update(id: string, patch: Partial<Broadcast>): Promise<Broadcast> {
    const { data, error } = await supabase.from('broadcasts').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as BroadcastRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('broadcasts').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Broadcast[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return broadcastsService.getAll()
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .or(`title.ilike.%${term}%,message.ilike.%${term}%,status.ilike.%${term}%`)
    if (error) throw error
    return (data as BroadcastRow[]).map(fromRow)
  },

  async submitForApproval(id: string): Promise<Broadcast> {
    return setStatus(id, 'pending-approval')
  },

  async approve(id: string): Promise<Broadcast> {
    return setStatus(id, 'approved')
  },

  async reject(id: string, note: string): Promise<Broadcast> {
    return setStatus(id, 'rejected', { reviewNote: note })
  },

  async sendNow(id: string): Promise<Broadcast> {
    const bc = await broadcastsService.getById(id)
    const delivered = bc ? Math.round(bc.audienceCount * 0.97) : 0
    return setStatus(id, 'sent', {
      sentAt: new Date().toISOString(),
      deliveredCount: delivered,
      readCount: Math.round(delivered * 0.6),
    })
  },
}
