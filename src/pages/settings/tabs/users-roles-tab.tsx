import { useState } from 'react'
import { toast } from 'sonner'
import { UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { RoleBadge } from '@/components/shared/role-badge'
import { doctors, frontDeskStaff } from '@/data'

interface StaffMember {
  id: string
  name: string
  title: string
  email: string
  role: 'doctor' | 'reception'
}

const seedStaff: StaffMember[] = [
  ...doctors.map((d) => ({ id: d.id, name: d.name, title: d.title, email: d.email, role: 'doctor' as const })),
  { id: frontDeskStaff.id, name: frontDeskStaff.name, title: frontDeskStaff.title, email: frontDeskStaff.email, role: 'reception' as const },
]

export function UsersRolesTab() {
  const [staff, setStaff] = useState(seedStaff)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'doctor' | 'reception'>('reception')

  function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) {
      toast.error('Add a name and email.')
      return
    }
    setStaff((s) => [
      ...s,
      { id: `staff-${s.length + 1}`, name, title: role === 'doctor' ? 'BDS' : 'Front Desk', email, role },
    ])
    toast.success('Invitation sent', { description: `${name} will get a login link by email.` })
    setOpen(false)
    setName('')
    setEmail('')
    setRole('reception')
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff accounts
          </CardTitle>
          <CardDescription>Who can log into the clinic system, and with what role.</CardDescription>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite user
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/40">
            <PatientAvatar id={s.id} name={s.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.name}</p>
              <p className="truncate text-xs text-muted-foreground">{s.email}</p>
            </div>
            <RoleBadge role={s.role} label={s.role === 'doctor' ? 'Doctor' : 'Front Desk'} />
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite staff member
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={invite} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">Name</Label>
              <Input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Email</Label>
              <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="reception">Front Desk / Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send invite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
