import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StaffManagementCard } from '@/components/shared/staff-management-card'
import { useClinicStore } from '@/state/store'

export function AdminUsersPage() {
  const { doctors, staff } = useClinicStore()
  const seedMembers = [
    ...doctors.map((d) => ({ id: d.id, name: d.name, title: d.title, email: d.email, role: 'doctor' as const })),
    ...staff.map((s) => ({
      id: s.id,
      name: s.name,
      title: s.title,
      email: s.email,
      role: s.role === 'admin' ? ('admin' as const) : ('reception' as const),
    })),
  ]

  return (
    <div>
      <PageHeader title="Users" description="Every account that can log into the clinic system." />
      <StaffManagementCard
        icon={<Users className="h-4 w-4" />}
        title="All users"
        description="Doctors, receptionists, and administrators."
        seedMembers={seedMembers}
        inviteRoles={['doctor', 'reception', 'admin']}
        defaultInviteRole="reception"
      />
    </div>
  )
}
