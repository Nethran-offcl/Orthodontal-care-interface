import { motion } from 'framer-motion'
import { CalendarDays, LayoutDashboard, MessageSquare, Receipt, Stethoscope, Users } from 'lucide-react'

const navIcons = [LayoutDashboard, CalendarDays, Users, MessageSquare, Receipt]

const rows = [
  { name: 'Ananya Sharma', time: '9:30 AM', reason: 'Root canal — follow-up', tone: 'bg-success/15 text-success' },
  { name: 'Rohan Verma', time: '10:15 AM', reason: 'Scaling & polishing', tone: 'bg-primary/15 text-primary' },
  { name: 'Kabir Malhotra', time: '11:00 AM', reason: 'Crown fitting', tone: 'bg-warning/15 text-warning' },
  { name: 'Ishita Nair', time: '11:45 AM', reason: 'New patient consult', tone: 'bg-accent text-accent-foreground' },
]

export function ProductPreview() {
  return (
    <section id="preview" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          A calm workspace, not another tab to babysit
        </h2>
        <p className="mt-3 text-balance text-muted-foreground">
          The same interface your team already knows how to use — just faster.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-panel"
      >
        {/* browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-border bg-secondary/50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
          <div className="ml-3 h-5 flex-1 max-w-xs rounded-md bg-background/80 px-2 text-[10px] leading-5 text-muted-foreground">
            app.sunrisedental.clinic
          </div>
        </div>

        {/* fake app shell */}
        <div className="flex">
          <div className="hidden w-14 shrink-0 flex-col items-center gap-4 border-r border-border bg-sidebar py-4 sm:flex">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="mt-2 flex flex-col gap-3">
              {navIcons.map((Icon, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${i === 0 ? 'bg-sidebar-accent text-foreground' : 'text-muted-foreground'}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Good morning, Dr. Rao</p>
                <p className="text-xs text-muted-foreground">Thursday, 12 rooms scheduled</p>
              </div>
              <div className="h-7 w-7 rounded-full bg-primary/20" />
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2.5">
              {[
                { label: "Today's patients", value: '12' },
                { label: 'Completed', value: '5 / 12' },
                { label: 'Active plans', value: '24' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-secondary/30 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-base font-semibold tabular">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              {rows.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5"
                >
                  <div className="h-7 w-7 shrink-0 rounded-full bg-secondary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{r.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{r.reason}</p>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${r.tone}`}>{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
