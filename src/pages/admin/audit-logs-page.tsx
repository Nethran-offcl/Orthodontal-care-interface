import { PageHeader } from '@/components/layout/page-header'
import { AuditLogTab } from '@/pages/settings/tabs/audit-log-tab'

export function AdminAuditLogsPage() {
  return (
    <div>
      <PageHeader title="Audit logs" description="Who changed what, and when — across the whole clinic system." />
      <AuditLogTab />
    </div>
  )
}
