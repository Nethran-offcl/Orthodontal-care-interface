import { Search, Bell } from 'lucide-react'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { ProfileMenu } from '@/components/layout/profile-menu'
import { RoleBadge } from '@/components/shared/role-badge'

const roleLabel = {
  doctor: { label: 'Doctor', role: 'doctor' as const },
  frontdesk: { label: 'Front Desk', role: 'reception' as const },
  patient: { label: 'Patient', role: 'patient' as const },
}

export function Topbar() {
  const { role, setCommandPaletteOpen, setNotificationsOpen } = useAppState()
  const { notifications } = useClinicStore()
  const unread = notifications.filter((n) => !n.read).length
  const roleInfo = roleLabel[role]

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex h-8 flex-1 max-w-md items-center gap-2 rounded-md border border-input bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">
          {role === 'patient' ? 'Search or run a command…' : 'Search patients, appointments…'}
        </span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <RoleBadge role={roleInfo.role} label={roleInfo.label} className="hidden sm:inline-flex" />

        <button
          onClick={() => setNotificationsOpen(true)}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          )}
        </button>

        <ProfileMenu />
      </div>
    </header>
  )
}
