import { useState } from 'react'
import { toast } from 'sonner'
import { Megaphone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClinicStore } from '@/state/store'

const audiences = [
  { label: 'All active patients', value: 'All active patients', count: 320 },
  { label: 'Patients with pending follow-ups', value: 'Patients with pending follow-ups', count: 46 },
  { label: 'Patients seen in the last 30 days', value: 'Patients seen in the last 30 days', count: 58 },
]

export function BroadcastComposerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { createBroadcast, submitBroadcastForApproval } = useClinicStore()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState(audiences[0].value)

  function reset() {
    setTitle('')
    setMessage('')
    setAudience(audiences[0].value)
  }

  function submit(sendForApproval: boolean) {
    if (!title || !message) {
      toast.error('Add a title and message before saving.')
      return
    }
    const chosen = audiences.find((a) => a.value === audience)!
    const bc = createBroadcast({
      title,
      message,
      audience,
      audienceCount: chosen.count,
      createdBy: 'Priya Kulkarni',
    })
    if (sendForApproval) {
      submitBroadcastForApproval(bc.id)
      toast.success('Sent for doctor approval')
    } else {
      toast.success('Saved as draft')
    }
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Compose broadcast
          </DialogTitle>
          <DialogDescription>
            Personalized with each patient's name. Needs doctor approval before it can send.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bc-title">Title</Label>
            <Input id="bc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diwali Closure Notice" />
          </div>
          <div className="space-y-1.5">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label} ({a.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bc-message">Message</Label>
            <Textarea
              id="bc-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Dear {{patient_name}}, …"
            />
            <p className="text-[11px] text-muted-foreground">
              Use <code className="rounded bg-secondary px-1 py-0.5">{'{{patient_name}}'}</code> — it's replaced per patient when sent.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => submit(false)}>
            Save as draft
          </Button>
          <Button onClick={() => submit(true)}>Submit for approval</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
