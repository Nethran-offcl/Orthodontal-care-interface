import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Stethoscope, Moon, Sun, ArrowLeft, Sparkles, CalendarCheck2, MessagesSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/state/auth-state'
import { useTheme } from '@/hooks/use-theme'

export function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Enter an email and password to continue.')
      return
    }
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      toast.success('Welcome back')
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
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
              <p className="text-sm text-muted-foreground">Enter your clinic credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
