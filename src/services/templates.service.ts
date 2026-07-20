import { supabase } from '@/lib/supabase'
import type { MessageTemplate } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface TemplateRow {
  id: string
  name: string
  category: MessageTemplate['category']
  body: string
  approval_status: MessageTemplate['approvalStatus']
  language: string
  used_count: number
}

function fromRow(row: TemplateRow): MessageTemplate {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    body: row.body,
    approvalStatus: row.approval_status,
    language: row.language,
    usedCount: row.used_count,
  }
}

function toRow(t: Partial<MessageTemplate>): Partial<TemplateRow> {
  const row: Partial<TemplateRow> = {}
  if (t.name !== undefined) row.name = t.name
  if (t.category !== undefined) row.category = t.category
  if (t.body !== undefined) row.body = t.body
  if (t.approvalStatus !== undefined) row.approval_status = t.approvalStatus
  if (t.language !== undefined) row.language = t.language
  if (t.usedCount !== undefined) row.used_count = t.usedCount
  return row
}

export const templatesService = {
  async getAll(): Promise<MessageTemplate[]> {
    const { data, error } = await supabase.from('message_templates').select('*').order('name')
    if (error) throw error
    return (data as TemplateRow[]).map(fromRow)
  },

  async getById(id: string): Promise<MessageTemplate | undefined> {
    const { data, error } = await supabase.from('message_templates').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as TemplateRow) : undefined
  },

  async create(input: Omit<MessageTemplate, 'id' | 'usedCount' | 'approvalStatus'>): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from('message_templates')
      .insert(toRow({ ...input, usedCount: 0, approvalStatus: 'pending' }))
      .select()
      .single()
    if (error) throw error
    return fromRow(data as TemplateRow)
  },

  async update(id: string, patch: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const { data, error } = await supabase.from('message_templates').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as TemplateRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('message_templates').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<MessageTemplate[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return templatesService.getAll()
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .or(`name.ilike.%${term}%,body.ilike.%${term}%,category.ilike.%${term}%`)
    if (error) throw error
    return (data as TemplateRow[]).map(fromRow)
  },
}
