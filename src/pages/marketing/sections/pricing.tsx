import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Starter',
    price: '₹4,999',
    period: '/month',
    description: 'Single-doctor clinics getting off spreadsheets.',
    features: ['1 doctor seat', 'Appointments & patient records', 'WhatsApp reminders', 'Basic reports'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₹9,999',
    period: '/month',
    description: 'Multi-doctor clinics that need AI charting and billing.',
    features: [
      'Up to 5 doctor seats',
      'Voice-to-chart & AI charting',
      'Billing & invoicing',
      'Broadcasts & templates',
      'Priority support',
    ],
    cta: 'Get started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Multi-location groups with custom needs.',
    features: ['Unlimited seats', 'Custom roles & permissions', 'Dedicated onboarding', 'SLA & audit logs'],
    cta: 'Contact sales',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-y border-border/60 bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing, per clinic
          </h2>
          <p className="mt-3 text-balance text-muted-foreground">
            Illustrative pricing — talk to us for a plan that fits your clinic.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={cn(
                'flex flex-col rounded-2xl border bg-card p-7',
                tier.highlighted ? 'border-primary shadow-panel' : 'border-border shadow-xs',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{tier.name}</h3>
                {tier.highlighted && <Badge>Most popular</Badge>}
              </div>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">{tier.price}</span>
                {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="mt-7" variant={tier.highlighted ? 'default' : 'outline'}>
                <Link to="/login">{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
