import type { StaffMember } from './types'

export const receptionists: StaffMember[] = [
  {
    id: 'staff-priya',
    name: 'Priya Kulkarni',
    title: 'Front Desk Receptionist',
    phone: '+91 98451 90045',
    email: 'priya.k@sunrisedental.clinic',
    role: 'receptionist',
    status: 'active',
  },
  {
    id: 'staff-anil',
    name: 'Anil Deshmukh',
    title: 'Receptionist',
    phone: '+91 98451 22310',
    email: 'anil.d@sunrisedental.clinic',
    role: 'receptionist',
    status: 'active',
  },
]

export const admins: StaffMember[] = [
  {
    id: 'staff-meera',
    name: 'Meera Iyer',
    title: 'Clinic Administrator',
    phone: '+91 98452 77190',
    email: 'meera.iyer@sunrisedental.clinic',
    role: 'admin',
    status: 'active',
  },
]

export function getStaff(id: string) {
  return [...receptionists, ...admins].find((s) => s.id === id)
}
