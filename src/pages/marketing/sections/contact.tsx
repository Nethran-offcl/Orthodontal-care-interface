import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [clinic, setClinic] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Fill in your name, email, and a short message.')
      return
    }
    toast.success('Message received', {
      description: "Our team will reach out within one business day.",
    })
    setName('')
    setEmail('')
    setClinic('')
    setMessage('')
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            Talk to us
          </h2>
          <p className="mt-3 text-muted-foreground">
            Questions about pricing, onboarding, or a live walkthrough — we usually reply the same
            day.
          </p>

          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Mail className="h-4 w-4" />
              </span>
              hello@sunrisedental.clinic
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Phone className="h-4 w-4" />
              </span>
              +91 98450 11234
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <MapPin className="h-4 w-4" />
              </span>
              Bengaluru, India
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-3"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-clinic">Clinic name</Label>
            <Input id="contact-clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us a bit about your clinic…"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Send message
          </Button>
        </motion.form>
      </div>
    </section>
  )
}
