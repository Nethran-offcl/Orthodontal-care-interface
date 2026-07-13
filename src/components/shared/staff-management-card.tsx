import { useState } from 'react'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
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
import { EmptyState } from '@/components/shared/empty-state'

export type StaffBadgeRole = 'doctor' | 'reception' | 'admin'

export interface StaffRow {
  id: string
  name: string
  title: string
  email: string
  role: StaffBadgeRole
}

const roleLabels: Record<StaffBadgeRole, string> = {
  doctor: 'Doctor',
  reception: 'Receptionist',
  admin: 'Administrator',
}

export function StaffManagementCard({
  icon,
  title,
  description,
  seedMembers,
  inviteRoles,
  defaultInviteRole,
}: {
  icon: React.ReactNode
  title: string
  description: string
  seedMembers: StaffRow[]
  inviteRoles: StaffBadgeRole[]
  defaultInviteRole: StaffBadgeRole
}) {
  const [members, setMembers] = useState(seedMembers)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StaffBadgeRole>(defaultInviteRole)

  function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toast.error('Add a name and email.')
      return
    }
    setMembers((m) => [
      ...m,
      { id: `staff-${m.length + 1}-${Date.now()}`, name, title: roleLabels[role], email, role },
    ])
    toast.success('Invitation sent', { description: `${name} will get a login link by email.` })
    setOpen(false)
    setName('')
    setEmail('')
    setRole(defaultInviteRole)
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {members.length === 0 ? (
          <EmptyState icon={icon} title="Nobody here yet" description="Invite someone to get started." className="border-none" />
        ) : (
          members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/40">
              <PatientAvatar id={m.id} name={m.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              <RoleBadge role={m.role} label={roleLabels[m.role]} />
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite
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
            {inviteRoles.length > 1 && (
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as StaffBadgeRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inviteRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabels[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
