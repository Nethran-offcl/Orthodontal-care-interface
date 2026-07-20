import type { Doctor } from '@/types'

export const doctors: Doctor[] = [
  {
    id: 'doc-rao',
    name: 'Dr. Arjun Rao',
    title: 'BDS, MDS (Periodontics)',
    registrationNo: 'KDC-19042',
    specialty: 'Periodontics & Implants',
    phone: '+91 98450 11234',
    email: 'arjun.rao@sunrisedental.clinic',
    color: 'role-doctor',
  },
  {
    id: 'doc-menon',
    name: 'Dr. Kavya Menon',
    title: 'BDS',
    registrationNo: 'KDC-22187',
    specialty: 'General & Cosmetic Dentistry',
    phone: '+91 98450 55678',
    email: 'kavya.menon@sunrisedental.clinic',
    color: 'role-system',
  },
]
