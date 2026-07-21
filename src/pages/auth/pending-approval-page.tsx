import { Clock3, LogOut, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/state/auth-state'

const roleLabels: Record<string, string> = {
  doctor: 'doctor',
  receptionist: 'receptionist',
}

export function PendingApprovalPage() {
  const { role, logout } = useAuth()

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Clock3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">Awaiting approval</h1>
          <p className="text-sm text-muted-foreground">
            Your account request as a {role ? roleLabels[role] ?? role : 'staff member'} has been sent to a clinic
            admin. You'll be able to sign in as soon as it's approved.
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Stethoscope className="h-3.5 w-3.5" />
          Sunrise Dental · Clinic OS
        </p>
      </div>
    </div>
  )
}
