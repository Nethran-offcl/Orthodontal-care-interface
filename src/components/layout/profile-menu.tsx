import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, Moon, Sun, UserCog } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { useTheme } from '@/hooks/use-theme'
import type { Doctor, StaffMember } from '@/types'

function useCurrentIdentity(doctors: Doctor[], staff: StaffMember[]) {
  const { role, userId } = useAuth()
  if (role === 'doctor') {
    const doc = doctors.find((d) => d.id === userId)
    return { name: doc?.name ?? 'Doctor', subtitle: doc?.title ?? '', id: userId ?? 'doctor' }
  }
  if (role === 'receptionist' || role === 'admin') {
    const member = staff.find((s) => s.id === userId)
    return { name: member?.name ?? 'Staff', subtitle: member?.title ?? '', id: userId ?? role }
  }
  return { name: 'Guest', subtitle: '', id: 'guest' }
}

export function ProfileMenu() {
  const { logout } = useAuth()
  const { doctors, staff } = useClinicStore()
  const { theme, toggleTheme } = useTheme()
  const identity = useCurrentIdentity(doctors, staff)
  const [accountOpen, setAccountOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors hover:bg-secondary">
            <PatientAvatar id={identity.id} name={identity.name} size="sm" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2 py-2 normal-case tracking-normal text-foreground">
            <PatientAvatar id={identity.id} name={identity.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{identity.name}</p>
              <p className="truncate text-xs text-muted-foreground">{identity.subtitle}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setAccountOpen(true)}>
            <UserCog className="h-4 w-4" />
            My account
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onSelect={() => {
              logout()
              toast('Signed out')
              navigate('/')
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>My account</DialogTitle>
            <DialogDescription>Prototype profile — changes here are not persisted.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
            <PatientAvatar id={identity.id} name={identity.name} size="lg" />
            <div>
              <p className="text-sm font-semibold">{identity.name}</p>
              <p className="text-xs text-muted-foreground">{identity.subtitle}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
