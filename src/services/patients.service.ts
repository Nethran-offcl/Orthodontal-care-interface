import { supabase } from '@/lib/supabase'
import type { Patient } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface PatientRow {
  id: string
  name: string
  phone: string
  age: number
  gender: Patient['gender']
  address: string
  lead_source: Patient['leadSource']
  registered_on: string
  allergies: string[]
  marketing_consent: boolean
  profile_completeness: number
  balance_due: number
  total_billed: number
  primary_doctor_id: string
  medical_conditions: string[] | null
  current_medications: string[] | null
  dental_history_notes: string | null
}

function fromRow(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    age: row.age,
    gender: row.gender,
    address: row.address,
    leadSource: row.lead_source,
    registeredOn: row.registered_on,
    allergies: row.allergies,
    marketingConsent: row.marketing_consent,
    profileCompleteness: row.profile_completeness,
    balanceDue: row.balance_due,
    totalBilled: row.total_billed,
    primaryDoctorId: row.primary_doctor_id,
    medicalConditions: row.medical_conditions ?? undefined,
    currentMedications: row.current_medications ?? undefined,
    dentalHistoryNotes: row.dental_history_notes ?? undefined,
  }
}

function toRow(patient: Partial<Patient>): Partial<PatientRow> {
  const row: Partial<PatientRow> = {}
  if (patient.name !== undefined) row.name = patient.name
  if (patient.phone !== undefined) row.phone = patient.phone
  if (patient.age !== undefined) row.age = patient.age
  if (patient.gender !== undefined) row.gender = patient.gender
  if (patient.address !== undefined) row.address = patient.address
  if (patient.leadSource !== undefined) row.lead_source = patient.leadSource
  if (patient.registeredOn !== undefined) row.registered_on = patient.registeredOn
  if (patient.allergies !== undefined) row.allergies = patient.allergies
  if (patient.marketingConsent !== undefined) row.marketing_consent = patient.marketingConsent
  if (patient.profileCompleteness !== undefined) row.profile_completeness = patient.profileCompleteness
  if (patient.balanceDue !== undefined) row.balance_due = patient.balanceDue
  if (patient.totalBilled !== undefined) row.total_billed = patient.totalBilled
  if (patient.primaryDoctorId !== undefined) row.primary_doctor_id = patient.primaryDoctorId
  if (patient.medicalConditions !== undefined) row.medical_conditions = patient.medicalConditions
  if (patient.currentMedications !== undefined) row.current_medications = patient.currentMedications
  if (patient.dentalHistoryNotes !== undefined) row.dental_history_notes = patient.dentalHistoryNotes
  return row
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    const { data, error } = await supabase.from('patients').select('*').order('name')
    if (error) throw error
    return (data as PatientRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Patient | undefined> {
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as PatientRow) : undefined
  },

  async create(input: Omit<Patient, 'id'>): Promise<Patient> {
    const { data, error } = await supabase.from('patients').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as PatientRow)
  },

  async update(id: string, patch: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase.from('patients').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as PatientRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('patients').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Patient[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return patientsService.getAll()
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`name.ilike.%${term}%,phone.ilike.%${term}%,id.ilike.%${term}%`)
    if (error) throw error
    return (data as PatientRow[]).map(fromRow)
  },
}
