import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowUpCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClinicStore } from '@/state/store'
import { useAuth } from '@/state/auth-state'
import type { Doctor, EscalationPriority, Role, StaffMember } from '@/types'

const roleOptions: { value: Role; label: string }[] = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'admin', label: 'Administrator' },
]

function assigneesForRole(role: Role, doctors: Doctor[], staff: StaffMember[]) {
  if (role === 'doctor') return doctors.map((d) => ({ id: d.id, name: d.name }))
  return staff.filter((s) => s.role === role).map((s) => ({ id: s.id, name: s.name }))
}

function currentActorName(role: string | null, userId: string | null, doctors: Doctor[], staff: StaffMember[]) {
  if (role === 'doctor') return doctors.find((d) => d.id === userId)?.name ?? 'Staff'
  return staff.find((s) => s.id === userId)?.name ?? 'Staff'
}

export function NewEscalationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { patients, doctors, staff, createEscalation } = useClinicStore()
  const { role, userId } = useAuth()

  const [patientId, setPatientId] = useState(patients[0]?.id ?? '')
  const [reason, setReason] = useState('')
  const [priority, setPriority] = useState<EscalationPriority>('medium')
  const [assignedRole, setAssignedRole] = useState<Role>('doctor')
  const [assignedToId, setAssignedToId] = useState(doctors[0]?.id ?? '')

  function reset() {
    setPatientId(patients[0]?.id ?? '')
    setReason('')
    setPriority('medium')
    setAssignedRole('doctor')
    setAssignedToId(doctors[0]?.id ?? '')
  }

  function handleRoleChange(next: Role) {
    setAssignedRole(next)
    setAssignedToId(assigneesForRole(next, doctors, staff)[0]?.id ?? '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId || !reason.trim()) {
      toast.error('Pick a patient and add a reason.')
      return
    }
    try {
      await createEscalation({
        patientId,
        reason,
        priority,
        assignedRole,
        assignedToId,
        createdBy: currentActorName(role, userId, doctors, staff),
      })
      toast.success('Escalation created')
      onOpenChange(false)
      reset()
    } catch {
      toast.error('Could not create the escalation', { description: 'Please try again.' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            New escalation
          </DialogTitle>
          <DialogDescription>Not tied to a conversation — for anything that needs routing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Search by name…" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-esc-reason">Reason</Label>
            <Textarea id="new-esc-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as EscalationPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assign to role</Label>
              <Select value={assignedRole} onValueChange={(v) => handleRoleChange(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Assignee</Label>
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assigneesForRole(assignedRole, doctors, staff).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create escalation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
