import { motion } from 'framer-motion'
import { Mic, Sparkles, Bot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const aiFeatures = [
  {
    icon: Mic,
    title: 'Voice-to-chart',
    description:
      'Record the consultation naturally — the visit is structured into chart entries, diagnoses, and procedures automatically.',
  },
  {
    icon: Bot,
    title: 'AI receptionist',
    description:
      'Answers routine WhatsApp questions, confirms appointments, and hands off to your front desk the moment it gets complex.',
  },
  {
    icon: Sparkles,
    title: 'Smart follow-ups',
    description:
      'Reminders are generated straight from each treatment plan — no manual tracking, no missed recall visits.',
  },
]

export function AiFeatures() {
  return (
    <section id="ai" className="border-y border-border/60 bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="accent" className="mb-3">
            <Sparkles className="h-3 w-3" />
            AI, built in
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            The parts of the day nobody wants to do manually
          </h2>
          <p className="mt-3 text-balance text-muted-foreground">
            AI handles the repetitive layer so your team can stay focused on the chair.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {aiFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-xl border border-primary/15 bg-card p-6 shadow-panel"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-60"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.15), transparent 70%)' }}
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
