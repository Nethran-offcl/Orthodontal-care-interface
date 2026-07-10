import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, MessageSquare, Radio } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useClinicStore } from '@/state/store'

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

  const [sendReminders, setSendReminders] = useState(true)
  const [sendDoctorCopy, setSendDoctorCopy] = useState(true)
  const [requireApproval, setRequireApproval] = useState(true)
  const [reminderLeadDays, setReminderLeadDays] = useState(true)

  function toggle(setter: (v: boolean) => void, current: boolean, label: string) {
    setter(!current)
    toast.success(`${label} ${!current ? 'enabled' : 'disabled'}`)
  }

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
              <p className="text-sm font-medium">Connected via Gupshup</p>
              <p className="text-xs text-muted-foreground">+91 80 4012 3456</p>
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
            checked={sendReminders}
            onCheckedChange={() => toggle(setSendReminders, sendReminders, 'Automatic reminders')}
          />
          <ToggleRow
            title="Send doctor a copy of every reminder"
            description="Keeps the doctor aware of who is due back, without checking the queue."
            checked={sendDoctorCopy}
            onCheckedChange={() => toggle(setSendDoctorCopy, sendDoctorCopy, 'Doctor copy')}
          />
          <ToggleRow
            title="Require doctor approval for broadcasts"
            description="Broadcasts cannot send to patients until a doctor reviews the content."
            checked={requireApproval}
            onCheckedChange={() => toggle(setRequireApproval, requireApproval, 'Broadcast approval requirement')}
          />
          <ToggleRow
            title="Send reminders at least 1 day ahead"
            description="Matches the clinic's standard operating procedure."
            checked={reminderLeadDays}
            onCheckedChange={() => toggle(setReminderLeadDays, reminderLeadDays, 'Reminder lead time')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message categories in use</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">Follow-up reminders</Badge>
          <Badge variant="secondary">Appointment confirmations</Badge>
          <Badge variant="secondary">Reschedule acknowledgments</Badge>
          <Badge variant="secondary">Broadcast announcements</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
