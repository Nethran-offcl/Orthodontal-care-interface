import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { UserCheck, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { profilesService, doctorsService, type PendingProfile, type SignupRole } from '@/services'
import type { Doctor } from '@/types'

export function PendingApprovalsCard() {
  const [pending, setPending] = useState<PendingProfile[] | null>(null)
  const [roleChoice, setRoleChoice] = useState<Record<string, SignupRole>>({})
  const [doctorChoice, setDoctorChoice] = useState<Record<string, string>>({})
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    profilesService
      .getPending()
      .then((rows) => {
        if (!alive) return
        setPending(rows)
        setRoleChoice(Object.fromEntries(rows.map((r) => [r.id, r.requestedRole ?? 'receptionist'])))
      })
      .catch((err) => {
        if (!alive) return
        setPending([])
        toast.error(err instanceof Error ? err.message : 'Could not load pending approvals')
      })
    doctorsService.getAll().then((rows) => {
      if (alive) setDoctors(rows)
    })
    return () => {
      alive = false
    }
  }, [])

  async function approve(id: string) {
    const role = roleChoice[id] ?? 'receptionist'
    const doctorId = doctorChoice[id]
    if (role === 'doctor' && !doctorId) {
      toast.error('Pick which doctor this account belongs to before approving')
      return
    }
    setBusyId(id)
    try {
      await profilesService.approve(id, role, doctorId)
      setPending((rows) => rows?.filter((r) => r.id !== id) ?? rows)
      toast.success('Account approved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not approve this account')
    } finally {
      setBusyId(null)
    }
  }

  async function reject(id: string) {
    setBusyId(id)
    try {
      await profilesService.reject(id)
      setPending((rows) => rows?.filter((r) => r.id !== id) ?? rows)
      toast.success('Account rejected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reject this account')
    } finally {
      setBusyId(null)
    }
  }

  if (pending === null) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Pending approvals
        </CardTitle>
        <CardDescription>Sign-up requests waiting for an admin to assign access.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {pending.length === 0 ? (
          <EmptyState icon={<UserCheck className="h-4 w-4" />} title="Nothing pending" description="New sign-ups will show up here." className="border-none" />
        ) : (
          pending.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/40">
              <PatientAvatar id={p.id} name={p.displayName ?? p.email ?? p.id} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.displayName || 'Unnamed'}</p>
                <p className="truncate text-xs text-muted-foreground">{p.email}</p>
              </div>
              <Select
                value={roleChoice[p.id] ?? 'receptionist'}
                onValueChange={(v) => setRoleChoice((c) => ({ ...c, [p.id]: v as SignupRole }))}
              >
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
              {(roleChoice[p.id] ?? 'receptionist') === 'doctor' && (
                <Select
                  value={doctorChoice[p.id] ?? ''}
                  onValueChange={(v) => setDoctorChoice((c) => ({ ...c, [p.id]: v }))}
                >
                  <SelectTrigger className="h-8 w-[160px]">
                    <SelectValue placeholder="Link to doctor…" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" disabled={busyId === p.id} onClick={() => approve(p.id)} aria-label="Approve">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" disabled={busyId === p.id} onClick={() => reject(p.id)} aria-label="Reject">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
