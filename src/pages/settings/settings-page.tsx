import { PageHeader } from '@/components/layout/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClinicProfileTab } from '@/pages/settings/tabs/clinic-profile-tab'
import { UsersRolesTab } from '@/pages/settings/tabs/users-roles-tab'
import { WhatsAppConfigTab } from '@/pages/settings/tabs/whatsapp-config-tab'
import { AuditLogTab } from '@/pages/settings/tabs/audit-log-tab'

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Clinic configuration, staff access, and WhatsApp setup." />

      <Tabs defaultValue="clinic">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="clinic">Clinic Profile</TabsTrigger>
          <TabsTrigger value="users">Users &amp; Roles</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Configuration</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="clinic">
          <ClinicProfileTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersRolesTab />
        </TabsContent>
        <TabsContent value="whatsapp">
          <WhatsAppConfigTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
