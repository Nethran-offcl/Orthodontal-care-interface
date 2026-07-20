import { supabase } from '@/lib/supabase'
import type { Appointment, AppointmentStatus } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface AppointmentRow {
  id: string
  patient_id: string
  doctor_id: string
  date: string
  start_time: string
  duration_min: number
  status: AppointmentStatus
  reason: string
  notes: string | null
  is_follow_up: boolean
  treatment_plan_id: string | null
}

function fromRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    date: row.date,
    startTime: row.start_time,
    durationMin: row.duration_min,
    status: row.status,
    reason: row.reason,
    notes: row.notes ?? undefined,
    isFollowUp: row.is_follow_up,
    treatmentPlanId: row.treatment_plan_id ?? undefined,
  }
}

function toRow(appt: Partial<Appointment>): Partial<AppointmentRow> {
  const row: Partial<AppointmentRow> = {}
  if (appt.patientId !== undefined) row.patient_id = appt.patientId
  if (appt.doctorId !== undefined) row.doctor_id = appt.doctorId
  if (appt.date !== undefined) row.date = appt.date
  if (appt.startTime !== undefined) row.start_time = appt.startTime
  if (appt.durationMin !== undefined) row.duration_min = appt.durationMin
  if (appt.status !== undefined) row.status = appt.status
  if (appt.reason !== undefined) row.reason = appt.reason
  if (appt.notes !== undefined) row.notes = appt.notes
  if (appt.isFollowUp !== undefined) row.is_follow_up = appt.isFollowUp
  if (appt.treatmentPlanId !== undefined) row.treatment_plan_id = appt.treatmentPlanId
  return row
}

export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*').order('date').order('start_time')
    if (error) throw error
    return (data as AppointmentRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Appointment | undefined> {
    const { data, error } = await supabase.from('appointments').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as AppointmentRow) : undefined
  },

  async create(input: Omit<Appointment, 'id'>): Promise<Appointment> {
    const { data, error } = await supabase.from('appointments').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as AppointmentRow)
  },

  async update(id: string, patch: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase.from('appointments').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as AppointmentRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Appointment[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return appointmentsService.getAll()
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .or(`reason.ilike.%${term}%,status.ilike.%${term}%,patient_id.ilike.%${term}%,doctor_id.ilike.%${term}%`)
    if (error) throw error
    return (data as AppointmentRow[]).map(fromRow)
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return appointmentsService.update(id, { status })
  },

  async reschedule(id: string, date: string, startTime: string): Promise<Appointment> {
    return appointmentsService.update(id, { date, startTime, status: 'confirmed' })
  },
}
