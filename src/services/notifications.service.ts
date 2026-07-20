import { supabase } from '@/lib/supabase'
import type { AppNotification } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface NotificationRow {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: AppNotification['type']
  href: string | null
}

function fromRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    time: row.time,
    read: row.read,
    type: row.type,
    href: row.href ?? undefined,
  }
}

function toRow(n: Partial<AppNotification>): Partial<NotificationRow> {
  const row: Partial<NotificationRow> = {}
  if (n.title !== undefined) row.title = n.title
  if (n.description !== undefined) row.description = n.description
  if (n.time !== undefined) row.time = n.time
  if (n.read !== undefined) row.read = n.read
  if (n.type !== undefined) row.type = n.type
  if (n.href !== undefined) row.href = n.href
  return row
}

type NotificationCreateInput = Omit<AppNotification, 'id' | 'time' | 'read'>

export const notificationsService = {
  async getAll(): Promise<AppNotification[]> {
    const { data, error } = await supabase.from('notifications').select('*').order('time', { ascending: false })
    if (error) throw error
    return (data as NotificationRow[]).map(fromRow)
  },

  async getById(id: string): Promise<AppNotification | undefined> {
    const { data, error } = await supabase.from('notifications').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as NotificationRow) : undefined
  },

  async create(input: NotificationCreateInput): Promise<AppNotification> {
    return notificationsService.push(input)
  },

  async update(id: string, patch: Partial<AppNotification>): Promise<AppNotification> {
    const { data, error } = await supabase.from('notifications').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as NotificationRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<AppNotification[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return notificationsService.getAll()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`title.ilike.%${term}%,description.ilike.%${term}%,type.ilike.%${term}%`)
    if (error) throw error
    return (data as NotificationRow[]).map(fromRow)
  },

  async push(input: NotificationCreateInput): Promise<AppNotification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(toRow({ ...input, time: new Date().toISOString(), read: false }))
      .select()
      .single()
    if (error) throw error
    return fromRow(data as NotificationRow)
  },

  async markRead(id: string): Promise<AppNotification> {
    return notificationsService.update(id, { read: true })
  },

  async markAllRead(): Promise<void> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false)
    if (error) throw error
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)
    if (error) throw error
    return count ?? 0
  },
}
