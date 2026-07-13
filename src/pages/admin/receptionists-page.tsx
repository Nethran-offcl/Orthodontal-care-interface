import { UsersRound } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StaffManagementCard } from '@/components/shared/staff-management-card'
import { receptionists } from '@/data'

const seedMembers = receptionists.map((r) => ({
  id: r.id,
  name: r.name,
  title: r.title,
  email: r.email,
  role: 'reception' as const,
}))

export function AdminReceptionistsPage() {
  return (
    <div>
      <PageHeader title="Receptionists" description="Front desk accounts across the clinic." />
      <StaffManagementCard
        icon={<UsersRound className="h-4 w-4" />}
        title="Receptionists"
        description="Everyone with a receptionist login."
        seedMembers={seedMembers}
        inviteRoles={['reception']}
        defaultInviteRole="reception"
      />
    </div>
  )
}
