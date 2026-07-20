import { supabase } from '@/lib/supabase'
import type { ChartEntry } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface ChartEntryRow {
  id: string
  patient_id: string
  date: string
  doctor_id: string
  tooth_area: string
  diagnosis: string
  procedure: string
  notes: string
  source: ChartEntry['source']
  transcript: string | null
}

function fromRow(row: ChartEntryRow): ChartEntry {
  return {
    id: row.id,
    patientId: row.patient_id,
    date: row.date,
    doctorId: row.doctor_id,
    toothArea: row.tooth_area,
    diagnosis: row.diagnosis,
    procedure: row.procedure,
    notes: row.notes,
    source: row.source,
    transcript: row.transcript ?? undefined,
  }
}

function toRow(entry: Partial<ChartEntry>): Partial<ChartEntryRow> {
  const row: Partial<ChartEntryRow> = {}
  if (entry.patientId !== undefined) row.patient_id = entry.patientId
  if (entry.date !== undefined) row.date = entry.date
  if (entry.doctorId !== undefined) row.doctor_id = entry.doctorId
  if (entry.toothArea !== undefined) row.tooth_area = entry.toothArea
  if (entry.diagnosis !== undefined) row.diagnosis = entry.diagnosis
  if (entry.procedure !== undefined) row.procedure = entry.procedure
  if (entry.notes !== undefined) row.notes = entry.notes
  if (entry.source !== undefined) row.source = entry.source
  if (entry.transcript !== undefined) row.transcript = entry.transcript
  return row
}

export const chartEntriesService = {
  async getAll(): Promise<ChartEntry[]> {
    const { data, error } = await supabase.from('chart_entries').select('*').order('date', { ascending: false })
    if (error) throw error
    return (data as ChartEntryRow[]).map(fromRow)
  },

  async getById(id: string): Promise<ChartEntry | undefined> {
    const { data, error } = await supabase.from('chart_entries').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as ChartEntryRow) : undefined
  },

  async create(input: Omit<ChartEntry, 'id'>): Promise<ChartEntry> {
    const { data, error } = await supabase.from('chart_entries').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as ChartEntryRow)
  },

  async update(id: string, patch: Partial<ChartEntry>): Promise<ChartEntry> {
    const { data, error } = await supabase.from('chart_entries').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as ChartEntryRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('chart_entries').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<ChartEntry[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return chartEntriesService.getAll()
    const { data, error } = await supabase
      .from('chart_entries')
      .select('*')
      .or(`diagnosis.ilike.%${term}%,procedure.ilike.%${term}%,tooth_area.ilike.%${term}%,patient_id.ilike.%${term}%`)
    if (error) throw error
    return (data as ChartEntryRow[]).map(fromRow)
  },
}
