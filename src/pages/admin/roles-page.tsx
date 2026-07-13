import { Check, Minus, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { RoleBadge } from '@/components/shared/role-badge'
import { cn } from '@/lib/utils'

const roles = [
  { key: 'doctor', label: 'Doctor' },
  { key: 'reception', label: 'Receptionist' },
  { key: 'admin', label: 'Administrator' },
] as const

const modules: { name: string; access: Record<(typeof roles)[number]['key'], boolean> }[] = [
  { name: 'Dashboard', access: { doctor: true, reception: true, admin: true } },
  { name: 'Appointments & calendar', access: { doctor: true, reception: true, admin: true } },
  { name: 'Patient records', access: { doctor: true, reception: true, admin: true } },
  { name: 'Consultation & charting', access: { doctor: true, reception: false, admin: false } },
  { name: 'Prescriptions', access: { doctor: true, reception: false, admin: false } },
  { name: 'Treatment plans', access: { doctor: true, reception: false, admin: false } },
  { name: 'Billing', access: { doctor: true, reception: true, admin: true } },
  { name: 'WhatsApp messaging', access: { doctor: true, reception: true, admin: true } },
  { name: 'Broadcast approval', access: { doctor: true, reception: false, admin: false } },
  { name: 'Reports', access: { doctor: true, reception: false, admin: true } },
  { name: 'Analytics', access: { doctor: false, reception: false, admin: true } },
  { name: 'Manage doctors & staff', access: { doctor: false, reception: false, admin: true } },
  { name: 'Audit logs', access: { doctor: false, reception: false, admin: true } },
  { name: 'AI settings', access: { doctor: false, reception: false, admin: true } },
  { name: 'Clinic settings', access: { doctor: false, reception: false, admin: true } },
]

export function AdminRolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles"
        description="What each role can see and do across the clinic system. Fixed for this release."
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Module</th>
                {roles.map((r) => (
                  <th key={r.key} className="px-5 py-3 text-center">
                    <RoleBadge role={r.key} label={r.label} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((m, i) => (
                <tr key={m.name} className={cn('border-b border-border/60', i % 2 === 1 && 'bg-secondary/20')}>
                  <td className="px-5 py-3 font-medium">{m.name}</td>
                  {roles.map((r) => (
                    <td key={r.key} className="px-5 py-3 text-center">
                      {m.access[r.key] ? (
                        <Check className="mx-auto h-4 w-4 text-success" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        Administrators have full access by design and can reach every module regardless of this table.
      </p>
    </div>
  )
}
