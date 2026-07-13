import { Stethoscope } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StaffManagementCard } from '@/components/shared/staff-management-card'
import { doctors } from '@/data'

const seedMembers = doctors.map((d) => ({
  id: d.id,
  name: d.name,
  title: d.title,
  email: d.email,
  role: 'doctor' as const,
}))

export function AdminDoctorsPage() {
  return (
    <div>
      <PageHeader title="Manage doctors" description="Doctor accounts and their clinic credentials." />
      <StaffManagementCard
        icon={<Stethoscope className="h-4 w-4" />}
        title="Doctors"
        description="Everyone with a doctor login."
        seedMembers={seedMembers}
        inviteRoles={['doctor']}
        defaultInviteRole="doctor"
      />
    </div>
  )
}
