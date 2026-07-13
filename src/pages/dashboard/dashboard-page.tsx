import { useAuth } from '@/state/auth-state'
import { DoctorDashboard } from '@/pages/dashboard/doctor-dashboard'
import { ReceptionistDashboard } from '@/pages/dashboard/receptionist-dashboard'
import { AdminDashboard } from '@/pages/dashboard/admin-dashboard'

export function DashboardPage() {
  const { role } = useAuth()

  if (role === 'doctor') return <DoctorDashboard />
  if (role === 'admin') return <AdminDashboard />
  return <ReceptionistDashboard />
}
