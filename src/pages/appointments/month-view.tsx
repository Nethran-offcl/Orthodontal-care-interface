import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/data/types'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MonthView({
  monthAnchor,
  selectedDate,
  appointments,
  onSelectDay,
}: {
  monthAnchor: Date
  selectedDate: Date
  appointments: Appointment[]
  onSelectDay: (d: Date) => void
}) {
  const gridStart = startOfWeek(startOfMonth(monthAnchor))
  const gridEnd = endOfWeek(endOfMonth(monthAnchor))
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const countByDate = new Map<string, number>()
  for (const a of appointments) {
    countByDate.set(a.date, (countByDate.get(a.date) ?? 0) + 1)
  }

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd')
          const count = countByDate.get(iso) ?? 0
          const inMonth = isSameMonth(day, monthAnchor)
          return (
            <button
              key={iso}
              onClick={() => onSelectDay(day)}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border text-sm transition-colors',
                isSameDay(day, selectedDate)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-secondary',
                !inMonth && 'opacity-35',
              )}
            >
              <span className={cn('font-medium', isToday(day) && !isSameDay(day, selectedDate) && 'text-primary')}>
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <span
                  className={cn(
                    'flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-semibold',
                    isSameDay(day, selectedDate) ? 'bg-primary-foreground/20' : 'bg-accent text-accent-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
