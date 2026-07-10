import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarPlus, FileText, Megaphone, MessageCircle, Receipt, User, UserPlus, CalendarDays } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { getDoctor } from '@/data'

export function CommandPalette() {
  const { role, commandPaletteOpen, setCommandPaletteOpen, setRole } = useAppState()
  const { patients, appointments } = useClinicStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const isStaff = role !== 'patient'

  const filteredPatients = useMemo(() => {
    if (!isStaff) return []
    const q = query.trim().toLowerCase()
    const list = !q
      ? patients.slice(0, 5)
      : patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            p.id.toLowerCase().includes(q),
        )
    return list.slice(0, 6)
  }, [patients, query, isStaff])

  const filteredAppointments = useMemo(() => {
    if (!isStaff) return []
    const q = query.trim().toLowerCase()
    if (!q) return []
    return appointments
      .filter((a) => {
        const patient = patients.find((p) => p.id === a.patientId)
        return (
          patient?.name.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)
        )
      })
      .slice(0, 5)
  }, [appointments, patients, query, isStaff])

  function go(path: string) {
    navigate(path)
    setCommandPaletteOpen(false)
    setQuery('')
  }

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput
        placeholder={isStaff ? 'Search patients, appointments, or run a command…' : 'Search or run a command…'}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {filteredPatients.length > 0 && (
          <CommandGroup heading="Patients">
            {filteredPatients.map((p) => (
              <CommandItem key={p.id} value={`patient-${p.id}-${p.name}`} onSelect={() => go(`/patients/${p.id}`)}>
                <PatientAvatar id={p.id} name={p.name} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{p.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {p.id} · {p.phone}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredAppointments.length > 0 && (
          <CommandGroup heading="Appointments">
            {filteredAppointments.map((a) => {
              const patient = patients.find((p) => p.id === a.patientId)
              const doctor = getDoctor(a.doctorId)
              return (
                <CommandItem
                  key={a.id}
                  value={`appt-${a.id}-${patient?.name}-${a.reason}`}
                  onSelect={() => go(`/appointments?focus=${a.id}`)}
                >
                  <CalendarDays className="h-4 w-4" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">
                      {patient?.name} — {a.reason}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {a.date} at {a.startTime} · {doctor?.name}
                    </span>
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          {isStaff ? (
            <>
              <CommandItem value="new-appointment" onSelect={() => go('/appointments?new=1')}>
                <CalendarPlus className="h-4 w-4" />
                Book new appointment
              </CommandItem>
              <CommandItem value="new-patient" onSelect={() => go('/patients?new=1')}>
                <UserPlus className="h-4 w-4" />
                Register new patient
              </CommandItem>
              <CommandItem value="new-broadcast" onSelect={() => go('/messaging/broadcasts?new=1')}>
                <Megaphone className="h-4 w-4" />
                Compose broadcast
              </CommandItem>
              <CommandItem value="billing" onSelect={() => go('/billing')}>
                <Receipt className="h-4 w-4" />
                Open billing
              </CommandItem>
              <CommandItem value="reports" onSelect={() => go('/reports')}>
                <FileText className="h-4 w-4" />
                Open reports
              </CommandItem>
            </>
          ) : (
            <>
              <CommandItem value="message-clinic" onSelect={() => go('/messaging')}>
                <MessageCircle className="h-4 w-4" />
                Message the clinic
              </CommandItem>
              <CommandItem value="my-bills" onSelect={() => go('/billing')}>
                <Receipt className="h-4 w-4" />
                View my bills
              </CommandItem>
              <CommandItem value="my-appointments" onSelect={() => go('/appointments')}>
                <CalendarDays className="h-4 w-4" />
                View my appointments
              </CommandItem>
            </>
          )}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Preview as">
          <CommandItem value="preview-doctor" onSelect={() => { setRole('doctor'); setCommandPaletteOpen(false) }}>
            <User className="h-4 w-4" />
            Doctor view
          </CommandItem>
          <CommandItem value="preview-frontdesk" onSelect={() => { setRole('frontdesk'); setCommandPaletteOpen(false) }}>
            <User className="h-4 w-4" />
            Front desk view
          </CommandItem>
          <CommandItem value="preview-patient" onSelect={() => { setRole('patient'); setCommandPaletteOpen(false) }}>
            <User className="h-4 w-4" />
            Patient view
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
