import { supabase } from '@/lib/supabase'
import type { Escalation, EscalationComment, EscalationHistoryEntry, EscalationStatus, Role } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface EscalationRow {
  id: string
  conversation_id: string | null
  patient_id: string
  reason: string
  priority: Escalation['priority']
  assigned_role: Role
  assigned_to_id: string | null
  status: EscalationStatus
  created_at: string
  created_by: string
  comments: EscalationComment[]
  history: EscalationHistoryEntry[]
}

function fromRow(row: EscalationRow): Escalation {
  return {
    id: row.id,
    conversationId: row.conversation_id ?? undefined,
    patientId: row.patient_id,
    reason: row.reason,
    priority: row.priority,
    assignedRole: row.assigned_role,
    assignedToId: row.assigned_to_id ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    createdBy: row.created_by,
    comments: row.comments,
    history: row.history,
  }
}

function toRow(e: Partial<Escalation>): Partial<EscalationRow> {
  const row: Partial<EscalationRow> = {}
  if (e.conversationId !== undefined) row.conversation_id = e.conversationId
  if (e.patientId !== undefined) row.patient_id = e.patientId
  if (e.reason !== undefined) row.reason = e.reason
  if (e.priority !== undefined) row.priority = e.priority
  if (e.assignedRole !== undefined) row.assigned_role = e.assignedRole
  if (e.assignedToId !== undefined) row.assigned_to_id = e.assignedToId
  if (e.status !== undefined) row.status = e.status
  if (e.createdAt !== undefined) row.created_at = e.createdAt
  if (e.createdBy !== undefined) row.created_by = e.createdBy
  if (e.comments !== undefined) row.comments = e.comments
  if (e.history !== undefined) row.history = e.history
  return row
}

type EscalationCreateInput = Omit<Escalation, 'id' | 'status' | 'createdAt' | 'comments' | 'history'>

export const escalationsService = {
  async getAll(): Promise<Escalation[]> {
    const { data, error } = await supabase.from('escalations').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data as EscalationRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Escalation | undefined> {
    const { data, error } = await supabase.from('escalations').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as EscalationRow) : undefined
  },

  async create(input: EscalationCreateInput): Promise<Escalation> {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('escalations')
      .insert(
        toRow({
          ...input,
          status: 'open',
          createdAt: now,
          comments: [],
          history: [{ id: crypto.randomUUID(), action: 'Escalation created', actor: input.createdBy, time: now }],
        }),
      )
      .select()
      .single()
    if (error) throw error
    return fromRow(data as EscalationRow)
  },

  async update(id: string, patch: Partial<Escalation>): Promise<Escalation> {
    const { data, error } = await supabase.from('escalations').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as EscalationRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('escalations').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Escalation[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return escalationsService.getAll()
    const { data, error } = await supabase
      .from('escalations')
      .select('*')
      .or(`reason.ilike.%${term}%,status.ilike.%${term}%,patient_id.ilike.%${term}%`)
    if (error) throw error
    return (data as EscalationRow[]).map(fromRow)
  },

  async updateStatus(id: string, status: EscalationStatus, actor: string): Promise<Escalation> {
    const esc = await escalationsService.getById(id)
    if (!esc) throw new Error(`Escalation not found: ${id}`)
    const history = [
      ...esc.history,
      { id: crypto.randomUUID(), action: `Marked ${status.replace('-', ' ')}`, actor, time: new Date().toISOString() },
    ]
    return escalationsService.update(id, { status, history })
  },

  async assign(id: string, assignedRole: Role, assignedToId: string, actor: string): Promise<Escalation> {
    const esc = await escalationsService.getById(id)
    if (!esc) throw new Error(`Escalation not found: ${id}`)
    const history = [...esc.history, { id: crypto.randomUUID(), action: 'Reassigned', actor, time: new Date().toISOString() }]
    return escalationsService.update(id, { assignedRole, assignedToId, history })
  },

  async addComment(id: string, author: string, text: string): Promise<Escalation> {
    const esc = await escalationsService.getById(id)
    if (!esc) throw new Error(`Escalation not found: ${id}`)
    const now = new Date().toISOString()
    const comments = [...esc.comments, { id: crypto.randomUUID(), author, text, time: now }]
    const history = [...esc.history, { id: crypto.randomUUID(), action: 'Comment added', actor: author, time: now }]
    return escalationsService.update(id, { comments, history })
  },
}
