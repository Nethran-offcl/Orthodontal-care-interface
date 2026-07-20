import { supabase } from '@/lib/supabase'
import type { Prescription } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface PrescriptionRow {
  id: string
  patient_id: string
  chart_entry_id: string | null
  date: string
  doctor_id: string
  medicines: Prescription['medicines']
  notes: string
}

function fromRow(row: PrescriptionRow): Prescription {
  return {
    id: row.id,
    patientId: row.patient_id,
    chartEntryId: row.chart_entry_id ?? undefined,
    date: row.date,
    doctorId: row.doctor_id,
    medicines: row.medicines,
    notes: row.notes,
  }
}

function toRow(rx: Partial<Prescription>): Partial<PrescriptionRow> {
  const row: Partial<PrescriptionRow> = {}
  if (rx.patientId !== undefined) row.patient_id = rx.patientId
  if (rx.chartEntryId !== undefined) row.chart_entry_id = rx.chartEntryId
  if (rx.date !== undefined) row.date = rx.date
  if (rx.doctorId !== undefined) row.doctor_id = rx.doctorId
  if (rx.medicines !== undefined) row.medicines = rx.medicines
  if (rx.notes !== undefined) row.notes = rx.notes
  return row
}

export const prescriptionsService = {
  async getAll(): Promise<Prescription[]> {
    const { data, error } = await supabase.from('prescriptions').select('*').order('date', { ascending: false })
    if (error) throw error
    return (data as PrescriptionRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Prescription | undefined> {
    const { data, error } = await supabase.from('prescriptions').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as PrescriptionRow) : undefined
  },

  async create(input: Omit<Prescription, 'id'>): Promise<Prescription> {
    const { data, error } = await supabase.from('prescriptions').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as PrescriptionRow)
  },

  async update(id: string, patch: Partial<Prescription>): Promise<Prescription> {
    const { data, error } = await supabase.from('prescriptions').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as PrescriptionRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('prescriptions').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Prescription[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return prescriptionsService.getAll()
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .or(`notes.ilike.%${term}%,patient_id.ilike.%${term}%`)
    if (error) throw error
    return (data as PrescriptionRow[]).map(fromRow)
  },
}
