import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Stethoscope,
  UsersRound,
  ShieldCheck,
  Moon,
  Sun,
  ArrowLeft,
  Sparkles,
  CalendarCheck2,
  MessagesSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/state/auth-state'
import { useTheme } from '@/hooks/use-theme'
import { doctors } from '@/data'
import { cn } from '@/lib/utils'
import type { Role } from '@/data/types'

const roleTiles: { role: Role; label: string; description: string; icon: typeof Stethoscope }[] = [
  { role: 'doctor', label: 'Doctor', description: 'Charting, consultations, treatment plans', icon: Stethoscope },
  { role: 'receptionist', label: 'Receptionist', description: 'Front desk, bookings, WhatsApp', icon: UsersRound },
  { role: 'admin', label: 'Administrator', description: 'Full clinic access & settings', icon: ShieldCheck },
]

export function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [role, setRole] = useState<Role>('doctor')
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Enter an email and password to continue.')
      return
    }
    const userId = role === 'doctor' ? doctorId : role === 'receptionist' ? 'staff-priya' : 'staff-meera'
    login(role, userId)
    toast.success('Welcome back')
    navigate('/')
  }

  function quickDemo(r: Role) {
    const userId = r === 'doctor' ? (doctorId || doctors[0]?.id || '') : r === 'receptionist' ? 'staff-priya' : 'staff-meera'
    login(r, userId)
    toast.success(`Signed in as ${roleTiles.find((t) => t.role === r)?.label}`)
    navigate('/')
  }

  return (
    <div className="flex min-h-svh w-full bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-[44%] shrink-0 overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between p-10 text-primary-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, hsl(var(--primary-foreground)/0.15), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--primary-foreground)/0.12), transparent 45%)',
          }}
        />
        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/15">
            <Stethoscope className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Sunrise Dental · Clinic OS</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md space-y-6"
        >
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance">
            Everything your clinic runs on, in one place.
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/80">
            Appointments, charting, billing, and WhatsApp follow-ups — built for how dental teams
            actually work day to day.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Sparkles className="h-4 w-4" />
              </span>
              Voice-to-chart consultations
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                <CalendarCheck2 className="h-4 w-4" />
              </span>
              One calendar for every doctor
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                <MessagesSquare className="h-4 w-4" />
              </span>
              WhatsApp-native follow-ups
            </div>
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-primary-foreground/60">
          Internal clinic staff tool — not patient-facing.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex min-h-svh flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm space-y-6"
          >
            <div className="space-y-1.5 lg:hidden">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Sunrise Dental</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
              <p className="text-sm text-muted-foreground">Choose your role to continue.</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {roleTiles.map((t) => (
                <button
                  key={t.role}
                  type="button"
                  onClick={() => setRole(t.role)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors',
                    role === t.role
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border hover:bg-secondary/60',
                  )}
                >
                  <t.icon className={cn('h-4.5 w-4.5', role === t.role ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-xs font-medium leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="-mt-3 text-xs text-muted-foreground">
              {roleTiles.find((t) => t.role === role)?.description}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {role === 'doctor' && (
                <div className="space-y-1.5">
                  <Label>Doctor</Label>
                  <Select value={doctorId} onValueChange={setDoctorId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@sunrisedental.clinic"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <span className="cursor-default text-xs text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </span>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in as {roleTiles.find((t) => t.role === role)?.label}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Quick demo</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-wrap gap-2">
              {roleTiles.map((t) => (
                <Button key={t.role} type="button" variant="outline" size="sm" onClick={() => quickDemo(t.role)}>
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label} demo
                </Button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              This is a prototype — any email and password will work.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
