import type { Role } from '@/types'

export type PermissionRoleKey = 'doctor' | 'reception' | 'admin'

export interface ModulePermission {
  name: string
  access: Record<PermissionRoleKey, boolean>
}

export const roleKeys: { key: PermissionRoleKey; label: string; role: Role }[] = [
  { key: 'doctor', label: 'Doctor', role: 'doctor' },
  { key: 'reception', label: 'Receptionist', role: 'receptionist' },
  { key: 'admin', label: 'Administrator', role: 'admin' },
]

export const permissionsMatrix: ModulePermission[] = [
  { name: 'Dashboard', access: { doctor: true, reception: true, admin: true } },
  { name: 'Appointments & calendar', access: { doctor: true, reception: true, admin: true } },
  { name: 'Patient records', access: { doctor: true, reception: true, admin: true } },
  { name: 'Consultation & charting', access: { doctor: true, reception: false, admin: false } },
  { name: 'Prescriptions', access: { doctor: true, reception: false, admin: false } },
  { name: 'Treatment plans', access: { doctor: true, reception: false, admin: false } },
  { name: 'Billing', access: { doctor: true, reception: true, admin: true } },
  { name: 'WhatsApp messaging', access: { doctor: true, reception: true, admin: true } },
  { name: 'Broadcast approval', access: { doctor: true, reception: false, admin: false } },
  { name: 'Reports', access: { doctor: true, reception: false, admin: true } },
  { name: 'Analytics', access: { doctor: false, reception: false, admin: true } },
  { name: 'Manage doctors & staff', access: { doctor: false, reception: false, admin: true } },
  { name: 'Audit logs', access: { doctor: false, reception: false, admin: true } },
  { name: 'AI settings', access: { doctor: false, reception: false, admin: true } },
  { name: 'Clinic settings', access: { doctor: false, reception: false, admin: true } },
]
