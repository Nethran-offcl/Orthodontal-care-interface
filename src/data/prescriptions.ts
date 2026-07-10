import type { Prescription } from './types'
import { daysFromToday } from './dates'

export const prescriptions: Prescription[] = [
  {
    id: 'RX-6001',
    patientId: 'PT-1001',
    chartEntryId: 'CE-5002',
    date: daysFromToday(0),
    doctorId: 'doc-rao',
    medicines: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Thrice daily', duration: '5 days' },
      { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'As needed for pain', duration: '3 days' },
    ],
    notes: 'Continue calcium hydroxide dressing until next visit. Avoid chewing on the left side.',
  },
  {
    id: 'RX-6002',
    patientId: 'PT-1003',
    chartEntryId: 'CE-5004',
    date: daysFromToday(0),
    doctorId: 'doc-rao',
    medicines: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Twice daily', duration: '6 days' },
      { name: 'Aceclofenac 100mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '4 days' },
      { name: 'Chlorhexidine mouthwash 0.2%', dosage: '10ml rinse', frequency: 'Twice daily', duration: '10 days' },
    ],
    notes: 'Soft diet for 48 hours. Return if swelling or pain increases beyond day 3.',
  },
  {
    id: 'RX-6003',
    patientId: 'PT-1007',
    chartEntryId: 'CE-5007',
    date: daysFromToday(-1),
    doctorId: 'doc-rao',
    medicines: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Thrice daily', duration: '5 days' },
      { name: 'Aceclofenac + Paracetamol', dosage: '1 tablet', frequency: 'Twice daily', duration: '3 days' },
    ],
    notes: 'Ice pack for first 24 hours, then warm saline rinses from day 2.',
  },
]

export function getPrescriptionsForPatient(patientId: string) {
  return prescriptions
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date))
}
