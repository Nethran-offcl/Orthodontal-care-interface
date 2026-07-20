import { supabase } from '@/lib/supabase'
import type { Doctor } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface DoctorRow {
  id: string
  name: string
  title: string
  registration_no: string
  specialty: string
  phone: string
  email: string
  color: string
}

function fromRow(row: DoctorRow): Doctor {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    registrationNo: row.registration_no,
    specialty: row.specialty,
    phone: row.phone,
    email: row.email,
    color: row.color,
  }
}

function toRow(doctor: Partial<Doctor>): Partial<DoctorRow> {
  const row: Partial<DoctorRow> = {}
  if (doctor.name !== undefined) row.name = doctor.name
  if (doctor.title !== undefined) row.title = doctor.title
  if (doctor.registrationNo !== undefined) row.registration_no = doctor.registrationNo
  if (doctor.specialty !== undefined) row.specialty = doctor.specialty
  if (doctor.phone !== undefined) row.phone = doctor.phone
  if (doctor.email !== undefined) row.email = doctor.email
  if (doctor.color !== undefined) row.color = doctor.color
  return row
}

export const doctorsService = {
  async getAll(): Promise<Doctor[]> {
    const { data, error } = await supabase.from('doctors').select('*').order('name')
    if (error) throw error
    return (data as DoctorRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Doctor | undefined> {
    const { data, error } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as DoctorRow) : undefined
  },

  async create(input: Omit<Doctor, 'id'>): Promise<Doctor> {
    const { data, error } = await supabase.from('doctors').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as DoctorRow)
  },

  async update(id: string, patch: Partial<Doctor>): Promise<Doctor> {
    const { data, error } = await supabase.from('doctors').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as DoctorRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('doctors').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Doctor[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return doctorsService.getAll()
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .or(`name.ilike.%${term}%,specialty.ilike.%${term}%,email.ilike.%${term}%,id.ilike.%${term}%`)
    if (error) throw error
    return (data as DoctorRow[]).map(fromRow)
  },
}
