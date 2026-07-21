import { supabase } from '@/lib/supabase'
import type { ProfileStatus, SignupRole } from './auth.service'
import type { Role } from '@/types'

export interface PendingProfile {
  id: string
  displayName: string | null
  email: string | null
  requestedRole: SignupRole | null
  createdAt: string
}

export interface ProfileSummary {
  id: string
  displayName: string | null
  email: string | null
  role: Role
  status: ProfileStatus
  createdAt: string
}

interface ProfileRow {
  id: string
  display_name: string | null
  email: string | null
  role: Role
  status: ProfileStatus
  requested_role: SignupRole | null
  created_at: string
}

export const profilesService = {
  async getPending(): Promise<PendingProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, requested_role, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as ProfileRow[]).map((row) => ({
      id: row.id,
      displayName: row.display_name,
      email: row.email,
      requestedRole: row.requested_role,
      createdAt: row.created_at,
    }))
  },

  /** Every account that isn't still awaiting approval — for the admin accounts list. */
  async getResolved(): Promise<ProfileSummary[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, role, status, created_at')
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as ProfileRow[]).map((row) => ({
      id: row.id,
      displayName: row.display_name,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
    }))
  },

  async approve(id: string, role: SignupRole): Promise<void> {
    const { error } = await supabase.from('profiles').update({ role, status: 'active' }).eq('id', id)
    if (error) throw error
  },

  async reject(id: string): Promise<void> {
    const { error } = await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id)
    if (error) throw error
  },

  /** Revokes an active account's access, or restores a rejected one — toggles status between 'active' and 'rejected'. */
  async setActive(id: string, active: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ status: active ? 'active' : 'rejected' })
      .eq('id', id)
    if (error) throw error
  },
}
