import { Badge } from '@/components/ui/badge'
import type {
  AppointmentStatus,
  BroadcastStatus,
  ConversationStatus,
  EscalationPriority,
  EscalationStatus,
  InvoiceStatus,
  ReminderStatus,
  TreatmentStageStatus,
} from '@/data/types'
import { cn } from '@/lib/utils'

const dotClass = 'h-1.5 w-1.5 rounded-full'

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' | 'accent'; dot: string }> = {
    confirmed: { label: 'Confirmed', variant: 'success', dot: 'bg-success' },
    pending: { label: 'Pending', variant: 'warning', dot: 'bg-warning' },
    'checked-in': { label: 'Checked in', variant: 'accent', dot: 'bg-primary' },
    completed: { label: 'Completed', variant: 'secondary', dot: 'bg-muted-foreground' },
    cancelled: { label: 'Cancelled', variant: 'destructive', dot: 'bg-destructive' },
    'no-show': { label: 'No-show', variant: 'destructive', dot: 'bg-destructive' },
  }
  const { label, variant, dot } = map[status]
  return (
    <Badge variant={variant}>
      <span className={cn(dotClass, dot)} />
      {label}
    </Badge>
  )
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const map: Record<InvoiceStatus, { label: string; variant: 'success' | 'warning' | 'accent' }> = {
    paid: { label: 'Paid', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    partial: { label: 'Partial', variant: 'accent' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
  const map: Record<ReminderStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' | 'accent' }> = {
    scheduled: { label: 'Scheduled', variant: 'secondary' },
    sent: { label: 'Sent', variant: 'accent' },
    confirmed: { label: 'Confirmed', variant: 'success' },
    'no-response': { label: 'No response', variant: 'destructive' },
    rescheduled: { label: 'Reschedule requested', variant: 'warning' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function BroadcastStatusBadge({ status }: { status: BroadcastStatus }) {
  const map: Record<BroadcastStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' | 'accent' }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    'pending-approval': { label: 'Pending approval', variant: 'warning' },
    approved: { label: 'Approved', variant: 'accent' },
    scheduled: { label: 'Scheduled', variant: 'accent' },
    sent: { label: 'Sent', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'destructive' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  const map: Record<ConversationStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'accent' | 'destructive' }> = {
    open: { label: 'Open', variant: 'accent' },
    pending: { label: 'Pending', variant: 'warning' },
    waiting: { label: 'Waiting', variant: 'destructive' },
    resolved: { label: 'Resolved', variant: 'success' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function EscalationStatusBadge({ status }: { status: EscalationStatus }) {
  const map: Record<EscalationStatus, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
    open: { label: 'Open', variant: 'warning' },
    'in-progress': { label: 'In progress', variant: 'secondary' },
    resolved: { label: 'Resolved', variant: 'success' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function EscalationPriorityBadge({ priority }: { priority: EscalationPriority }) {
  const map: Record<EscalationPriority, { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' }> = {
    low: { label: 'Low', variant: 'secondary' },
    medium: { label: 'Medium', variant: 'warning' },
    high: { label: 'High', variant: 'destructive' },
    urgent: { label: 'Urgent', variant: 'destructive' },
  }
  const { label, variant } = map[priority]
  return <Badge variant={variant}>{label}</Badge>
}

export function StageStatusBadge({ status }: { status: TreatmentStageStatus }) {
  const map: Record<TreatmentStageStatus, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
    planned: { label: 'Planned', variant: 'secondary' },
    'in-progress': { label: 'In progress', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}
