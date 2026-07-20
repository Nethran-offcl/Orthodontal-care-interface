import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, CalendarPlus, FileText, Megaphone, Receipt, UserPlus, CalendarDays } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setAiAssistantOpen } = useAppState()
  const { patients, appointments, doctors } = useClinicStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase()
    const tokens = q.split(/\s+/).filter(Boolean)
    const list = tokens.length === 0
      ? patients.slice(0, 5)
      : patients.filter((p) => {
          const haystack = `${p.name} ${p.phone.replace(/\s/g, '')} ${p.id}`.toLowerCase()
          return tokens.every((t) => haystack.includes(t))
        })
    return list.slice(0, 6)
  }, [patients, query])

  const filteredAppointments = useMemo(() => {
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
  }, [appointments, patients, query])

  function go(path: string) {
    navigate(path)
    setCommandPaletteOpen(false)
    setQuery('')
  }

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput
        placeholder="Search patients, appointments, or run a command…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {query.trim() && (
          <div className="flex items-center justify-end px-2 pt-2">
            <Badge variant="accent" className="text-[10px]">
              AI-ranked
            </Badge>
          </div>
        )}

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
              const doctor = doctors.find((d) => d.id === a.doctorId)
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
          <CommandItem
            value="ask-ai"
            onSelect={() => { setAiAssistantOpen(true); setCommandPaletteOpen(false) }}
          >
            <Bot className="h-4 w-4" />
            Ask AI
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
