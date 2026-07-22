import { supabase } from '@/lib/supabase'
import type { StructuredChart } from './voice.service'

export interface VoiceNote {
  id: string
  doctorId: string
  transcript: string
  toothArea?: string
  diagnosis?: string
  procedure?: string
  notes?: string
  createdAt: string
}

interface VoiceNoteRow {
  id: string
  doctor_id: string
  transcript: string
  tooth_area: string | null
  diagnosis: string | null
  procedure: string | null
  notes: string | null
  created_at: string
}

function fromRow(row: VoiceNoteRow): VoiceNote {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    transcript: row.transcript,
    toothArea: row.tooth_area ?? undefined,
    diagnosis: row.diagnosis ?? undefined,
    procedure: row.procedure ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }
}

export const voiceNotesService = {
  async getAllForDoctor(doctorId: string): Promise<VoiceNote[]> {
    const { data, error } = await supabase
      .from('voice_notes')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as VoiceNoteRow[]).map(fromRow)
  },

  async create(doctorId: string, transcript: string, structured: StructuredChart): Promise<VoiceNote> {
    const { data, error } = await supabase
      .from('voice_notes')
      .insert({
        doctor_id: doctorId,
        transcript,
        tooth_area: structured.toothArea || null,
        diagnosis: structured.diagnosis || null,
        procedure: structured.procedure || null,
        notes: structured.notes || null,
      })
      .select()
      .single()
    if (error) throw error
    return fromRow(data as VoiceNoteRow)
  },
}
