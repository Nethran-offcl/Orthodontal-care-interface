import { supabase } from '@/lib/supabase'
import type { StaffMember } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

type StaffRow = StaffMember

export const usersService = {
  async getAll(): Promise<StaffMember[]> {
    const { data, error } = await supabase.from('staff_members').select('*').order('name')
    if (error) throw error
    return data as StaffRow[]
  },

  async getById(id: string): Promise<StaffMember | undefined> {
    const { data, error } = await supabase.from('staff_members').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return (data as StaffRow) ?? undefined
  },

  async create(input: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    const { data, error } = await supabase.from('staff_members').insert(input).select().single()
    if (error) throw error
    return data as StaffRow
  },

  async update(id: string, patch: Partial<StaffMember>): Promise<StaffMember> {
    const { data, error } = await supabase.from('staff_members').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data as StaffRow
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('staff_members').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<StaffMember[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return usersService.getAll()
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .or(`name.ilike.%${term}%,email.ilike.%${term}%,title.ilike.%${term}%,id.ilike.%${term}%`)
    if (error) throw error
    return data as StaffRow[]
  },

  async getByRole(role: StaffMember['role']): Promise<StaffMember[]> {
    const { data, error } = await supabase.from('staff_members').select('*').eq('role', role).order('name')
    if (error) throw error
    return data as StaffRow[]
  },
}
