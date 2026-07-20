import { supabase } from '@/lib/supabase'
import type { AuditLogEntry } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

type AuditLogRow = AuditLogEntry

export const auditLogService = {
  async getAll(): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase.from('audit_log').select('*').order('time', { ascending: false })
    if (error) throw error
    return data as AuditLogRow[]
  },

  async getById(id: string): Promise<AuditLogEntry | undefined> {
    const { data, error } = await supabase.from('audit_log').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return (data as AuditLogRow) ?? undefined
  },

  async create(input: Omit<AuditLogEntry, 'id'>): Promise<AuditLogEntry> {
    const { data, error } = await supabase.from('audit_log').insert(input).select().single()
    if (error) throw error
    return data as AuditLogRow
  },

  async search(query: string): Promise<AuditLogEntry[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return auditLogService.getAll()
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .or(`actor.ilike.%${term}%,action.ilike.%${term}%,target.ilike.%${term}%`)
    if (error) throw error
    return data as AuditLogRow[]
  },

  async log(actor: string, action: string, target: string): Promise<AuditLogEntry> {
    const { data, error } = await supabase
      .from('audit_log')
      .insert({ actor, action, target, time: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return data as AuditLogRow
  },
}
