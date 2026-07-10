import { cn } from '@/lib/utils'

export interface BarListItem {
  label: string
  value: number
  toneClass?: string
}

export function BarList({
  items,
  formatValue = (v) => String(v),
}: {
  items: BarListItem[]
  formatValue?: (value: number) => string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="tabular text-muted-foreground">{formatValue(item.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full rounded-full', item.toneClass ?? 'bg-primary')}
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
