import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Users2,
  UserPlus,
  MessageCircle,
  Camera,
  ThumbsUp,
  CalendarPlus,
  PhoneCall,
  Receipt,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Stethoscope,
  Mic,
  Sparkles,
  Pill,
  ClipboardList,
  History,
  ImagePlus,
  UsersRound,
  ShieldCheck,
  FileText,
  LineChart,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppState } from '@/state/app-state'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  end?: boolean
}

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppState()
  const { role } = useAuth()
  const { conversations, broadcasts } = useClinicStore()

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread, 0)
  const pendingBroadcasts = broadcasts.filter((b) => b.status === 'pending-approval').length
  const messagingBadge = unreadMessages + pendingBroadcasts

  const doctorNav: NavItem[] = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
    { label: "Today's Patients", to: '/today', icon: Users2 },
    { label: 'Calendar', to: '/appointments', icon: CalendarDays },
    { label: 'Voice Notes', to: '/voice-notes', icon: Mic },
    { label: 'AI Charting', to: '/ai-charting', icon: Sparkles },
    { label: 'Prescriptions', to: '/prescriptions', icon: Pill },
    { label: 'Treatment Plans', to: '/treatment-plans', icon: ClipboardList },
    { label: 'Patient Timeline', to: '/timeline', icon: History },
    { label: 'Image Upload', to: '/image-upload', icon: ImagePlus },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
  ]

  const receptionistNav: NavItem[] = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
    { label: 'Appointments', to: '/appointments', icon: CalendarDays },
    { label: 'Patient Registration', to: '/patients', icon: UserPlus },
    { label: 'AI Receptionist', to: '/ai-receptionist', icon: Bot },
    { label: 'WhatsApp', to: '/messaging?channel=whatsapp', icon: MessageCircle, badge: messagingBadge || undefined },
    { label: 'Instagram', to: '/messaging?channel=instagram', icon: Camera },
    { label: 'Facebook', to: '/messaging?channel=facebook', icon: ThumbsUp },
    { label: 'Booking', to: '/booking', icon: CalendarPlus },
    { label: 'Follow-ups', to: '/messaging/reminders', icon: PhoneCall },
    { label: 'Billing Overview', to: '/billing', icon: Receipt },
  ]

  const adminNav: NavItem[] = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
    { label: 'Manage Doctors', to: '/admin/doctors', icon: Stethoscope },
    { label: 'Receptionists', to: '/admin/receptionists', icon: UsersRound },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Roles', to: '/admin/roles', icon: ShieldCheck },
    { label: 'Templates', to: '/messaging/templates', icon: FileText },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
    { label: 'Analytics', to: '/admin/analytics', icon: LineChart },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: History },
    { label: 'AI Settings', to: '/admin/ai-settings', icon: Sparkles },
    { label: 'Clinic Settings', to: '/settings', icon: Settings },
  ]

  const nav = role === 'doctor' ? doctorNav : role === 'admin' ? adminNav : receptionistNav
  const showBottomSettings = role !== 'admin'

  return (
    <aside
      className={cn(
        'flex h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        sidebarCollapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <div className={cn('flex h-14 items-center gap-2 px-4', sidebarCollapsed && 'justify-center px-0')}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Stethoscope className="h-4 w-4" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">Sunrise Dental</p>
            <p className="truncate text-[11px] leading-tight text-muted-foreground">Clinic OS</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-2 scrollbar-thin">
        {nav.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {showBottomSettings && (
        <div className="px-2.5 pb-2">
          <SidebarLink
            item={{ label: 'Settings', to: '/settings', icon: Settings }}
            collapsed={sidebarCollapsed}
          />
        </div>
      )}

      <div className="flex items-center justify-center border-t border-sidebar-border p-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation()
  const [itemPath, itemSearch = ''] = item.to.split('?')
  const isActive = item.end
    ? location.pathname === itemPath
    : itemSearch
      ? location.pathname === itemPath && location.search === `?${itemSearch}`
      : location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`)

  const link = (
    <Link
      to={item.to}
      className={cn(
        'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-0',
        isActive
          ? 'bg-sidebar-accent text-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground',
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge ? (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold text-primary-foreground">
          {item.badge}
        </span>
      ) : null}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}
