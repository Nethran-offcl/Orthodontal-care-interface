import { useNavigate } from 'react-router-dom'
import { Bell, Megaphone, CreditCard, MessageSquare, Info, CalendarClock } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/shared/empty-state'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { NotificationType } from '@/data/types'

const iconMap: Record<NotificationType, typeof Bell> = {
  reminder: CalendarClock,
  payment: CreditCard,
  message: MessageSquare,
  system: Info,
  broadcast: Megaphone,
}

export function NotificationsPanel() {
  const { notificationsOpen, setNotificationsOpen } = useAppState()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useClinicStore()
  const navigate = useNavigate()

  const sorted = [...notifications].sort((a, b) => b.time.localeCompare(a.time))

  return (
    <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>Reminders, replies, payments and approvals.</SheetDescription>
          </div>
        </SheetHeader>
        <div className="flex items-center justify-between px-5 pt-3">
          <p className="text-xs text-muted-foreground">{sorted.filter((n) => !n.read).length} unread</p>
          <Button variant="ghost" size="sm" onClick={markAllNotificationsRead} className="h-7 px-2 text-xs">
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3 py-2">
          {sorted.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-5 w-5" />}
              title="You're all caught up"
              description="New reminders, messages and approvals will show up here."
            />
          ) : (
            <div className="flex flex-col gap-1 pb-4">
              {sorted.map((n) => {
                const Icon = iconMap[n.type]
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id)
                      if (n.href) {
                        navigate(n.href)
                        setNotificationsOpen(false)
                      }
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-secondary',
                      !n.read && 'bg-accent/60',
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                        {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{n.description}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(n.time)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
