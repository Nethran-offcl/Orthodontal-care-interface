import { Users } from 'lucide-react'
import { StaffManagementCard } from '@/components/shared/staff-management-card'
import { useClinicStore } from '@/state/store'

export function UsersRolesTab() {
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
    <StaffManagementCard
      icon={<Users className="h-4 w-4" />}
      title="Staff accounts"
      description="Who can log into the clinic system, and with what role."
      seedMembers={seedMembers}
      inviteRoles={['doctor', 'reception', 'admin']}
      defaultInviteRole="reception"
    />
  )
}
