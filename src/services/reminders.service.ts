import { supabase } from '@/lib/supabase'
import type { Reminder, ReminderStatus } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface ReminderRow {
  id: string
  patient_id: string
  appointment_id: string
  treatment_plan_id: string | null
  due_date: string
  status: ReminderStatus
  sent_at: string | null
}

function fromRow(row: ReminderRow): Reminder {
  return {
    id: row.id,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    treatmentPlanId: row.treatment_plan_id ?? undefined,
    dueDate: row.due_date,
    status: row.status,
    sentAt: row.sent_at ?? undefined,
  }
}

function toRow(reminder: Partial<Reminder>): Partial<ReminderRow> {
  const row: Partial<ReminderRow> = {}
  if (reminder.patientId !== undefined) row.patient_id = reminder.patientId
  if (reminder.appointmentId !== undefined) row.appointment_id = reminder.appointmentId
  if (reminder.treatmentPlanId !== undefined) row.treatment_plan_id = reminder.treatmentPlanId
  if (reminder.dueDate !== undefined) row.due_date = reminder.dueDate
  if (reminder.status !== undefined) row.status = reminder.status
  if (reminder.sentAt !== undefined) row.sent_at = reminder.sentAt
  return row
}

export const remindersService = {
  async getAll(): Promise<Reminder[]> {
    const { data, error } = await supabase.from('reminders').select('*').order('due_date')
    if (error) throw error
    return (data as ReminderRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Reminder | undefined> {
    const { data, error } = await supabase.from('reminders').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as ReminderRow) : undefined
  },

  async create(input: Omit<Reminder, 'id'>): Promise<Reminder> {
    const { data, error } = await supabase.from('reminders').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as ReminderRow)
  },

  async update(id: string, patch: Partial<Reminder>): Promise<Reminder> {
    const { data, error } = await supabase.from('reminders').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as ReminderRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('reminders').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Reminder[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return remindersService.getAll()
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .or(`status.ilike.%${term}%,patient_id.ilike.%${term}%`)
    if (error) throw error
    return (data as ReminderRow[]).map(fromRow)
  },

  async updateStatus(id: string, status: ReminderStatus): Promise<Reminder> {
    return remindersService.update(id, { status })
  },

  async getUnconfirmed(): Promise<Reminder[]> {
    const { data, error } = await supabase.from('reminders').select('*').in('status', ['no-response', 'rescheduled'])
    if (error) throw error
    return (data as ReminderRow[]).map(fromRow)
  },
}
