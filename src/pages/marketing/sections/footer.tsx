import { Link } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', href: '#product' },
      { label: 'AI features', href: '#ai' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'Contact', href: '#contact' },
      { label: 'Log in', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">Sunrise Dental</span>
            </Link>
            <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
              The operating system for modern dental clinics.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Sunrise Dental · Clinic OS. All rights reserved.</span>
          <span>Internal clinic tool — not patient-facing.</span>
        </div>
      </div>
    </footer>
  )
}
