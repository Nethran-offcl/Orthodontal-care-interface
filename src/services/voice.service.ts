import { supabase } from '@/lib/supabase'

export interface StructuredChart {
  toothArea: string
  diagnosis: string
  procedure: string
  notes: string
  followUpDays: number | null
  suggestedMedicines: { name: string; dosage: string; frequency: string; duration: string }[]
}

export interface ChartContext {
  appointmentReason?: string
  patientName?: string
}

export const voiceService = {
  /** Sends recorded audio to Groq Whisper (via the transcribe-audio Edge Function) and returns the transcript. */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const { data, error } = await supabase.functions.invoke('transcribe-audio', {
      body: audioBlob,
      headers: { 'Content-Type': audioBlob.type || 'audio/webm' },
    })
    if (error) throw error
    return data.transcript as string
  },

  /**
   * Structures a real transcript into chart fields via Groq chat completions (structure-chart
   * Edge Function). Context is optional — a standalone voice note has no appointment yet.
   */
  async generateStructuredChart(transcript: string, context: ChartContext = {}): Promise<StructuredChart> {
    const { data, error } = await supabase.functions.invoke('structure-chart', {
      body: { transcript, appointmentReason: context.appointmentReason, patientName: context.patientName },
    })
    if (error) throw error
    return data as StructuredChart
  },
}
