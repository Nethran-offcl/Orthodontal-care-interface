import { History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { useClinicStore } from '@/state/store'
import { formatRelativeTime } from '@/lib/utils'

export function AuditLogTab() {
  const { auditLog } = useClinicStore()
  const sorted = [...auditLog].sort((a, b) => b.time.localeCompare(a.time))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Activity log
        </CardTitle>
        <CardDescription>Who changed what, and when — across the whole clinic system.</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <EmptyState icon={<History className="h-5 w-5" />} title="No activity yet" className="border-none" />
        ) : (
          <div className="space-y-0.5">
            {sorted.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-secondary/40">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                <div className="min-w-0 flex-1">
                  <p>
                    <span className="font-medium">{entry.actor}</span>{' '}
                    <span className="text-muted-foreground">{entry.action.toLowerCase()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.target}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(entry.time)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
