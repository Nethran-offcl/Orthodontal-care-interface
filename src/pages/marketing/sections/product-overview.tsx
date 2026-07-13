import { motion } from 'framer-motion'
import { CalendarDays, ClipboardList, MessageSquare, Receipt } from 'lucide-react'

const features = [
  {
    icon: CalendarDays,
    title: 'Appointments & calendar',
    description: 'Day, week, and month views across every doctor — booking, confirmations, and reschedules in one place.',
  },
  {
    icon: ClipboardList,
    title: 'Patient records & charting',
    description: 'Full treatment history, chart entries, prescriptions, and images — organized per patient, per visit.',
  },
  {
    icon: Receipt,
    title: 'Billing & invoicing',
    description: 'Invoices, payments, and outstanding balances tracked automatically as treatment plans progress.',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp messaging',
    description: 'Reminders, confirmations, and doctor-approved broadcasts — sent where patients already are.',
  },
]

export function ProductOverview() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything your clinic runs on
        </h2>
        <p className="mt-3 text-balance text-muted-foreground">
          One system, replacing the spreadsheet, the register, and the four different apps.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-xl border border-border bg-card p-6 shadow-xs"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
