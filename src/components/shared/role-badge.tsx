import { cn } from '@/lib/utils'

const roleStyles = {
  doctor: 'text-role-doctor bg-role-doctor/10',
  reception: 'text-role-reception bg-role-reception/10',
  admin: 'text-role-admin bg-role-admin/10',
  system: 'text-role-system bg-role-system/10',
} as const

export function RoleBadge({
  role,
  label,
  className,
}: {
  role: keyof typeof roleStyles
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide',
        roleStyles[role],
        className,
      )}
    >
      {label}
    </span>
  )
}
