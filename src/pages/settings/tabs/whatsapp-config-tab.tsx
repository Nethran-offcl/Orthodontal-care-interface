import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, MessageSquare, Radio } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useClinicStore } from '@/state/store'
import { settingsService } from '@/services'
import type { WhatsAppConfig } from '@/mocks/whatsappConfig'

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export function WhatsAppConfigTab() {
  const { templates } = useClinicStore()
  const approved = templates.filter((t) => t.approvalStatus === 'approved').length
  const pending = templates.filter((t) => t.approvalStatus === 'pending').length

  const [config, setConfig] = useState<WhatsAppConfig | null>(null)

  useEffect(() => {
    let alive = true
    settingsService.getWhatsAppConfig().then((c) => {
      if (alive) setConfig(c)
    })
    return () => {
      alive = false
    }
  }, [])

  async function toggle(key: keyof WhatsAppConfig['automation'], label: string) {
    if (!config) return
    const next = !config.automation[key]
    const updated = await settingsService.updateWhatsAppAutomation({ [key]: next })
    setConfig(updated)
    toast.success(`${label} ${next ? 'enabled' : 'disabled'}`)
  }

  if (!config) return null

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Connection
          </CardTitle>
          <CardDescription>WhatsApp Business API, via a Business Solution Provider.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <div>
              <p className="text-sm font-medium">Connected via {config.provider}</p>
              <p className="text-xs text-muted-foreground">{config.phone}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-sm font-medium">Message templates</p>
            <p className="text-xs text-muted-foreground">
              {approved} approved · {pending} pending Meta review
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Automation rules
          </CardTitle>
          <CardDescription>How reminders and broadcasts behave by default.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow
            title="Send follow-up reminders automatically"
            description="Nightly job checks treatment plans and appointments due tomorrow."
            checked={config.automation.sendReminders}
            onCheckedChange={() => toggle('sendReminders', 'Automatic reminders')}
          />
          <ToggleRow
            title="Send doctor a copy of every reminder"
            description="Keeps the doctor aware of who is due back, without checking the queue."
            checked={config.automation.sendDoctorCopy}
            onCheckedChange={() => toggle('sendDoctorCopy', 'Doctor copy')}
          />
          <ToggleRow
            title="Require doctor approval for broadcasts"
            description="Broadcasts cannot send to patients until a doctor reviews the content."
            checked={config.automation.requireApproval}
            onCheckedChange={() => toggle('requireApproval', 'Broadcast approval requirement')}
          />
          <ToggleRow
            title="Send reminders at least 1 day ahead"
            description="Matches the clinic's standard operating procedure."
            checked={config.automation.reminderLeadDays}
            onCheckedChange={() => toggle('reminderLeadDays', 'Reminder lead time')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message categories in use</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {config.messageCategories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
