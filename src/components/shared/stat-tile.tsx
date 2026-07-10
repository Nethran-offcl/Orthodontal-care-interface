import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatTile({
  label,
  value,
  icon,
  trend,
  trendTone = 'neutral',
  className,
  onClick,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  trend?: string
  trendTone?: 'positive' | 'negative' | 'neutral'
  className?: string
  onClick?: () => void
}) {
  const toneClass =
    trendTone === 'positive'
      ? 'text-success'
      : trendTone === 'negative'
        ? 'text-destructive'
        : 'text-muted-foreground'

  return (
    <Card
      className={cn(
        'transition-shadow',
        onClick && 'cursor-pointer hover:shadow-panel',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="tabular text-2xl font-semibold leading-none">{value}</p>
          {trend && <p className={cn('text-xs font-medium', toneClass)}>{trend}</p>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
