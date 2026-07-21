import { PageHeader } from '@/components/layout/page-header'
import { PendingApprovalsCard } from '@/components/shared/pending-approvals-card'
import { AccountsCard } from '@/components/shared/accounts-card'

export function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Users" description="Every account that can log into the clinic system." />
      <PendingApprovalsCard />
      <AccountsCard />
    </div>
  )
}
