import { useState } from 'react'
import { toast } from 'sonner'
import { Bot, MessageCircle, Mic, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const toggles = [
  {
    key: 'voice-to-chart',
    icon: Mic,
    title: 'Voice-to-chart',
    description: 'Structure consultation recordings into chart entries automatically.',
    defaultOn: true,
  },
  {
    key: 'ai-charting',
    icon: Sparkles,
    title: 'AI charting suggestions',
    description: 'Suggest diagnoses and procedures while a doctor is charting.',
    defaultOn: true,
  },
  {
    key: 'ai-receptionist',
    icon: Bot,
    title: 'AI receptionist',
    description: 'Answer routine WhatsApp questions before handing off to front desk.',
    defaultOn: false,
  },
  {
    key: 'smart-followups',
    icon: MessageCircle,
    title: 'Smart follow-up suggestions',
    description: 'Recommend reminder timing based on treatment plan progress.',
    defaultOn: true,
  },
]

export function AdminAiSettingsPage() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map((t) => [t.key, t.defaultOn])),
  )

  function toggle(key: string, label: string) {
    setState((s) => {
      const next = !s[key]
      toast(next ? `${label} enabled` : `${label} disabled`)
      return { ...s, [key]: next }
    })
  }

  return (
    <div>
      <PageHeader
        title="AI settings"
        description="Configure which AI-assisted features are active across the clinic."
      />

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{t.title}</p>
                  {!state[t.key] && (
                    <Badge variant="secondary" className="text-[10px]">
                      Off
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              </div>
              <Switch checked={state[t.key]} onCheckedChange={() => toggle(t.key, t.title)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        These toggles control which AI surfaces are visible to staff — some features are still
        being rolled out and are marked "Coming soon" where you see them.
      </p>
    </div>
  )
}
