import { permissionsMatrix as seedPermissionsMatrix, roleKeys } from '@/mocks'
import type { ModulePermission, PermissionRoleKey } from '@/mocks/permissions'
import type { Role } from '@/types'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'sunrise-auth'

export type ProfileStatus = 'pending' | 'active' | 'rejected'
export type SignupRole = Extract<Role, 'doctor' | 'receptionist'>

export interface AuthSession {
  role: Role
  userId: string
  status: ProfileStatus
}

interface ProfileRow {
  role: Role
  doctor_id: string | null
  staff_id: string | null
  status: ProfileStatus
}

async function sessionFromUserId(userId: string): Promise<AuthSession | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, doctor_id, staff_id, status')
    .eq('id', userId)
    .single<ProfileRow>()

  if (error || !data) return null

  const id = data.role === 'doctor' ? data.doctor_id : data.staff_id
  return { role: data.role, userId: id ?? userId, status: data.status }
}

let permissionsMatrix: ModulePermission[] = seedPermissionsMatrix.map((m) => ({ ...m, access: { ...m.access } }))

export const authService = {
  /** Reads the live Supabase session, if any, joined with its profile row. */
  async getSession(): Promise<AuthSession | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null
    return sessionFromUserId(session.user.id)
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw error ?? new Error('Sign in failed')

    const session = await sessionFromUserId(data.user.id)
    if (!session) throw new Error('No profile found for this account — ask an admin to set one up.')
    return session
  },

  /**
   * Creates an auth user; a DB trigger creates the matching profile row with
   * status 'pending' and the requested role. Returns null if email
   * confirmation is required (no session yet, nothing to gate on).
   * Admin approval, not this call, decides whether the role sticks.
   */
  async signUp(email: string, password: string, displayName: string, requestedRole: SignupRole): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, requested_role: requestedRole } },
    })
    if (error) throw error
    if (!data.user) throw new Error('Sign up failed')
    if (!data.session) return null

    return sessionFromUserId(data.user.id)
  },

  async logout(): Promise<void> {
    sessionStorage.removeItem(STORAGE_KEY)
    await supabase.auth.signOut()
  },

  // --- Roles & permissions (admin/roles-page.tsx) — still mock-backed, moves to Supabase in Phase 9 ---
  async getPermissionsMatrix(): Promise<ModulePermission[]> {
    return permissionsMatrix.map((m) => ({ ...m, access: { ...m.access } }))
  },

  async getRoleKeys() {
    return roleKeys
  },

  async updatePermission(moduleName: string, role: PermissionRoleKey, allowed: boolean): Promise<ModulePermission> {
    permissionsMatrix = permissionsMatrix.map((m) =>
      m.name === moduleName ? { ...m, access: { ...m.access, [role]: allowed } } : m,
    )
    return permissionsMatrix.find((m) => m.name === moduleName)!
  },
}
