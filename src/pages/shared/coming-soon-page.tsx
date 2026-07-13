import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function ComingSoonPage({
  icon,
  title,
  tagline,
  description,
  bullets,
  ctaLabel,
  ctaTo,
}: {
  icon: React.ReactNode
  title: string
  tagline: string
  description: string
  bullets: string[]
  ctaLabel: string
  ctaTo: string
}) {
  return (
    <div>
      <PageHeader title={title} description={tagline} />

      <Card>
        <CardContent className="flex flex-col items-center gap-5 px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            {icon}
          </div>
          <div className="space-y-2">
            <Badge variant="accent">
              <Sparkles className="h-3 w-3" />
              Coming soon
            </Badge>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>

          <ul className="mx-auto max-w-sm space-y-1.5 text-left text-sm text-muted-foreground">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                {b}
              </li>
            ))}
          </ul>

          <Button asChild>
            <Link to={ctaTo}>{ctaLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
