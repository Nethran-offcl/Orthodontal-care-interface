import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bot, MessageCircle, Mic, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { aiService } from '@/services'
import type { AiFeatureToggle } from '@/mocks/aiSettings'

const iconByKey: Record<string, typeof Mic> = {
  'voice-to-chart': Mic,
  'ai-charting': Sparkles,
  'ai-receptionist': Bot,
  'smart-followups': MessageCircle,
}

export function AdminAiSettingsPage() {
  const [toggles, setToggles] = useState<AiFeatureToggle[]>([])

  useEffect(() => {
    let alive = true
    aiService.getSettings().then((settings) => {
      if (alive) setToggles(settings)
    })
    return () => {
      alive = false
    }
  }, [])

  async function toggle(key: string, label: string) {
    const current = toggles.find((t) => t.key === key)
    if (!current) return
    const updated = await aiService.updateSetting(key, !current.enabled)
    setToggles((ts) => ts.map((t) => (t.key === key ? updated : t)))
    toast(updated.enabled ? `${label} enabled` : `${label} disabled`)
  }

  return (
    <div>
      <PageHeader
        title="AI settings"
        description="Configure which AI-assisted features are active across the clinic."
      />

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {toggles.map((t) => {
            const Icon = iconByKey[t.key] ?? Sparkles
            return (
              <div key={t.key} className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{t.title}</p>
                    {!t.enabled && (
                      <Badge variant="secondary" className="text-[10px]">
                        Off
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                </div>
                <Switch checked={t.enabled} onCheckedChange={() => toggle(t.key, t.title)} />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        These toggles control which AI surfaces are visible to staff — some features are still
        being rolled out and are marked "Coming soon" where you see them.
      </p>
    </div>
  )
}
