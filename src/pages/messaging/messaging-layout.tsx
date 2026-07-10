import { NavLink, Outlet } from 'react-router-dom'
import { PageHeader } from '@/components/layout/page-header'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { cn } from '@/lib/utils'

export function MessagingLayout() {
  const { role } = useAppState()
  const { conversations, reminders, broadcasts } = useClinicStore()

  if (role === 'patient') {
    // Patients see a simplified single-thread view, not the full ops console.
    return <Outlet />
  }

  const unreadMessages = conversations.reduce((s, c) => s + c.unread, 0)
  const needsCall = reminders.filter((r) => r.status === 'no-response' || r.status === 'rescheduled').length
  const pendingBroadcasts = broadcasts.filter((b) => b.status === 'pending-approval').length

  const tabs = [
    { to: '/messaging', label: 'Inbox', end: true, badge: unreadMessages },
    { to: '/messaging/reminders', label: 'Reminders', badge: needsCall },
    { to: '/messaging/broadcasts', label: 'Broadcasts', badge: pendingBroadcasts },
    { to: '/messaging/templates', label: 'Templates' },
  ]

  return (
    <div>
      <PageHeader title="Messaging" description="The WhatsApp layer — reminders, replies, and broadcasts in one place." />

      <div className="mb-5 flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {!!tab.badge && (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold text-primary-foreground">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
