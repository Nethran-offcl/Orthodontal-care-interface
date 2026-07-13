import { Users } from 'lucide-react'
import { StaffManagementCard } from '@/components/shared/staff-management-card'
import { doctors, receptionists, admins } from '@/data'

const seedMembers = [
  ...doctors.map((d) => ({ id: d.id, name: d.name, title: d.title, email: d.email, role: 'doctor' as const })),
  ...receptionists.map((r) => ({ id: r.id, name: r.name, title: r.title, email: r.email, role: 'reception' as const })),
  ...admins.map((a) => ({ id: a.id, name: a.name, title: a.title, email: a.email, role: 'admin' as const })),
]

export function UsersRolesTab() {
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
