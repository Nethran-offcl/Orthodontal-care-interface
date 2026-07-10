import { useAppState } from '@/state/app-state'
import { DoctorDashboard } from '@/pages/dashboard/doctor-dashboard'
import { FrontDeskDashboard } from '@/pages/dashboard/front-desk-dashboard'
import { PatientDashboard } from '@/pages/dashboard/patient-dashboard'

export function DashboardPage() {
  const { role } = useAppState()

  if (role === 'doctor') return <DoctorDashboard />
  if (role === 'patient') return <PatientDashboard />
  return <FrontDeskDashboard />
}
