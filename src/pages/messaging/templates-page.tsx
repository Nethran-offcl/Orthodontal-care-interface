import { useState } from 'react'
import { FilePlus, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { NewTemplateDialog } from '@/pages/messaging/new-template-dialog'
import { useClinicStore } from '@/state/store'

export function TemplatesPage() {
  const { templates } = useClinicStore()
  const [open, setOpen] = useState(false)

  const grouped = new Map<string, typeof templates>()
  for (const t of templates) {
    const list = grouped.get(t.category) ?? []
    list.push(t)
    grouped.set(t.category, list)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          WhatsApp Business requires pre-approved templates for business-initiated messages.
        </p>
        <Button onClick={() => setOpen(true)}>
          <FilePlus className="h-4 w-4" />
          New template
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState icon={<FileText className="h-5 w-5" />} title="No templates yet" />
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([category, list]) => (
            <div key={category}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{category}</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {list.map((t) => (
                  <Card key={t.id}>
                    <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm">{t.name}</CardTitle>
                      <Badge variant={t.approvalStatus === 'approved' ? 'success' : 'warning'}>
                        {t.approvalStatus === 'approved' ? 'Approved' : 'Pending Meta approval'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t.body}</p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{t.language}</span>
                        <span>Used {t.usedCount} times</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <NewTemplateDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
