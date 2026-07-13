import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { PatientAvatar } from '@/components/shared/patient-avatar'

const quotes = [
  {
    id: 'q1',
    quote:
      'Voice-to-chart alone gave me back close to an hour a day. I finish my notes before the patient has even left the chair.',
    name: 'Dr. Arjun Rao',
    title: 'Periodontics & Implants',
  },
  {
    id: 'q2',
    quote:
      'Follow-ups used to live in my head. Now the system reminds patients on WhatsApp before I even think to.',
    name: 'Priya Kulkarni',
    title: 'Front Desk Lead',
  },
  {
    id: 'q3',
    quote:
      'Switching between three apps for billing, scheduling, and messaging was the actual bottleneck — not the dentistry.',
    name: 'Dr. Kavya Menon',
    title: 'General & Cosmetic Dentistry',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Trusted by clinic teams
        </h2>
        <p className="mt-3 text-balance text-muted-foreground">
          A few words from the people using it every day.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.figure
            key={q.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-xs"
          >
            <Quote className="h-5 w-5 text-primary/50" />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
              "{q.quote}"
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-2.5">
              <PatientAvatar id={q.id} name={q.name} size="sm" />
              <div>
                <p className="text-xs font-semibold">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.title}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
