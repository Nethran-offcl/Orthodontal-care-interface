import { useEffect, useState } from 'react'
import { Check, Minus, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { RoleBadge } from '@/components/shared/role-badge'
import { authService } from '@/services'
import type { ModulePermission, PermissionRoleKey } from '@/mocks/permissions'
import { cn } from '@/lib/utils'

const roles: { key: PermissionRoleKey; label: string }[] = [
  { key: 'doctor', label: 'Doctor' },
  { key: 'reception', label: 'Receptionist' },
  { key: 'admin', label: 'Administrator' },
]

export function AdminRolesPage() {
  const [modules, setModules] = useState<ModulePermission[]>([])

  useEffect(() => {
    let alive = true
    authService.getPermissionsMatrix().then((matrix) => {
      if (alive) setModules(matrix)
    })
    return () => {
      alive = false
    }
  }, [])

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
