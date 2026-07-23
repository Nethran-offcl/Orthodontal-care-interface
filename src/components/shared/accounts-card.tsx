import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Users, Ban, RotateCcw, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { RoleBadge } from '@/components/shared/role-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { profilesService, doctorsService, type ProfileSummary } from '@/services'
import type { Doctor, Role } from '@/types'

const roleBadgeKey: Record<Role, 'doctor' | 'reception' | 'admin'> = {
  doctor: 'doctor',
  receptionist: 'reception',
  admin: 'admin',
}

const roleLabels: Record<Role, string> = {
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  admin: 'Administrator',
}

export function AccountsCard() {
  const [accounts, setAccounts] = useState<ProfileSummary[] | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    profilesService
      .getResolved()
      .then((rows) => {
        if (alive) setAccounts(rows)
      })
      .catch((err) => {
        if (!alive) return
        setAccounts([])
        toast.error(err instanceof Error ? err.message : 'Could not load accounts')
      })
    doctorsService.getAll().then((rows) => {
      if (alive) setDoctors(rows)
    })
    return () => {
      alive = false
    }
  }, [])

  async function linkDoctor(accountId: string, doctorId: string) {
    setBusyId(accountId)
    try {
      await profilesService.linkDoctor(accountId, doctorId)
      setAccounts((rows) => rows?.map((r) => (r.id === accountId ? { ...r, doctorId } : r)) ?? rows)
      toast.success('Doctor linked — this account can now save clinical records')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not link this account to a doctor')
    } finally {
      setBusyId(null)
    }
  }

  async function toggleActive(account: ProfileSummary) {
    setBusyId(account.id)
    try {
      await profilesService.setActive(account.id, account.status !== 'active')
      setAccounts((rows) =>
        rows?.map((r) => (r.id === account.id ? { ...r, status: r.status === 'active' ? 'rejected' : 'active' } : r)) ?? rows,
      )
      toast.success(account.status === 'active' ? 'Access revoked' : 'Access restored')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update this account')
    } finally {
      setBusyId(null)
    }
  }

  if (accounts === null) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          All accounts
        </CardTitle>
        <CardDescription>Every approved or rejected login — doctors, receptionists, and admins.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {accounts.length === 0 ? (
          <EmptyState icon={<Users className="h-4 w-4" />} title="No accounts yet" description="Approved sign-ups will show up here." className="border-none" />
        ) : (
          accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/40">
              <PatientAvatar id={a.id} name={a.displayName ?? a.email ?? a.id} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.displayName || 'Unnamed'}</p>
                <p className="truncate text-xs text-muted-foreground">{a.email}</p>
              </div>
              <RoleBadge role={roleBadgeKey[a.role]} label={roleLabels[a.role]} />
              {a.role === 'doctor' && !a.doctorId && (
                <>
                  <Badge variant="destructive" className="gap-1">
                    <TriangleAlert className="h-3 w-3" />
                    Not linked
                  </Badge>
                  <Select value="" onValueChange={(v) => linkDoctor(a.id, v)}>
                    <SelectTrigger className="h-8 w-[160px]" disabled={busyId === a.id}>
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
                </>
              )}
              {a.status === 'rejected' && <Badge variant="destructive">Revoked</Badge>}
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 shrink-0"
                disabled={busyId === a.id}
                onClick={() => toggleActive(a)}
                aria-label={a.status === 'active' ? 'Revoke access' : 'Restore access'}
              >
                {a.status === 'active' ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
