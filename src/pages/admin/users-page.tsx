import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StaffManagementCard } from '@/components/shared/staff-management-card'
import { doctors, receptionists, admins } from '@/data'

const seedMembers = [
  ...doctors.map((d) => ({ id: d.id, name: d.name, title: d.title, email: d.email, role: 'doctor' as const })),
  ...receptionists.map((r) => ({ id: r.id, name: r.name, title: r.title, email: r.email, role: 'reception' as const })),
  ...admins.map((a) => ({ id: a.id, name: a.name, title: a.title, email: a.email, role: 'admin' as const })),
]

export function AdminUsersPage() {
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
