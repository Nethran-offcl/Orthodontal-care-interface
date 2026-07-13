import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground sm:px-16"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, hsl(var(--primary-foreground)/0.15), transparent 40%), radial-gradient(circle at 85% 80%, hsl(var(--primary-foreground)/0.12), transparent 45%)',
          }}
        />
        <h2 className="relative z-10 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to modernize your clinic?
        </h2>
        <p className="relative z-10 mx-auto mt-3 max-w-xl text-balance text-primary-foreground/80">
          Set up takes minutes. Bring your doctors, front desk, and admin team into one workspace.
        </p>
        <Button asChild size="lg" variant="secondary" className="relative z-10 mt-7">
          <Link to="/login">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  )
}
