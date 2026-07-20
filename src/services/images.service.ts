import { supabase } from '@/lib/supabase'
import type { ImageAnnotation, PatientImage } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

const BUCKET = 'patient-images'
const SIGNED_URL_TTL_SECONDS = 60 * 60

interface PatientImageRow {
  id: string
  patient_id: string
  tooth_area: string
  note: string
  date: string
  marketing_consent: boolean
  category: PatientImage['category']
  annotations: ImageAnnotation[]
  storage_path: string
  uploaded_by_doctor_id: string | null
}

function fromRow(row: PatientImageRow): PatientImage {
  return {
    id: row.id,
    patientId: row.patient_id,
    toothArea: row.tooth_area,
    note: row.note,
    date: row.date,
    marketingConsent: row.marketing_consent,
    category: row.category,
    annotations: row.annotations,
    storagePath: row.storage_path,
    uploadedByDoctorId: row.uploaded_by_doctor_id ?? undefined,
  }
}

function toRow(image: Partial<PatientImage>): Partial<PatientImageRow> {
  const row: Partial<PatientImageRow> = {}
  if (image.patientId !== undefined) row.patient_id = image.patientId
  if (image.toothArea !== undefined) row.tooth_area = image.toothArea
  if (image.note !== undefined) row.note = image.note
  if (image.date !== undefined) row.date = image.date
  if (image.marketingConsent !== undefined) row.marketing_consent = image.marketingConsent
  if (image.category !== undefined) row.category = image.category
  if (image.annotations !== undefined) row.annotations = image.annotations
  if (image.storagePath !== undefined) row.storage_path = image.storagePath
  if (image.uploadedByDoctorId !== undefined) row.uploaded_by_doctor_id = image.uploadedByDoctorId
  return row
}

export const imagesService = {
  async getAll(): Promise<PatientImage[]> {
    const { data, error } = await supabase.from('patient_images').select('*').order('date', { ascending: false })
    if (error) throw error
    return (data as PatientImageRow[]).map(fromRow)
  },

  async getById(id: string): Promise<PatientImage | undefined> {
    const { data, error } = await supabase.from('patient_images').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as PatientImageRow) : undefined
  },

  /** Uploads `file` to Storage, then inserts the metadata row pointing at it. */
  async create(input: Omit<PatientImage, 'id' | 'storagePath'>, file: File): Promise<PatientImage> {
    const path = `patients/${input.patientId}/${crypto.randomUUID()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file)
    if (uploadError) throw uploadError

    const { data, error } = await supabase
      .from('patient_images')
      .insert(toRow({ ...input, storagePath: path }))
      .select()
      .single()
    if (error) throw error
    return fromRow(data as PatientImageRow)
  },

  async update(id: string, patch: Partial<PatientImage>): Promise<PatientImage> {
    const { data, error } = await supabase.from('patient_images').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as PatientImageRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('patient_images').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<PatientImage[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return imagesService.getAll()
    const { data, error } = await supabase
      .from('patient_images')
      .select('*')
      .or(`tooth_area.ilike.%${term}%,note.ilike.%${term}%,category.ilike.%${term}%,patient_id.ilike.%${term}%`)
    if (error) throw error
    return (data as PatientImageRow[]).map(fromRow)
  },

  async addAnnotation(imageId: string, annotation: Omit<ImageAnnotation, 'id'>): Promise<ImageAnnotation> {
    const image = await imagesService.getById(imageId)
    if (!image) throw new Error(`Image not found: ${imageId}`)
    const newAnnotation: ImageAnnotation = { ...annotation, id: crypto.randomUUID() }
    await imagesService.update(imageId, { annotations: [...image.annotations, newAnnotation] })
    return newAnnotation
  },

  /** Signed, time-limited URL for rendering a private-bucket image. */
  async getSignedUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)
    if (error) throw error
    return data.signedUrl
  },
}
