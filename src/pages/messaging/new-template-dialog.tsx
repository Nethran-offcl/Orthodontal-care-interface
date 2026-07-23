import { useState } from 'react'
import { toast } from 'sonner'
import { FilePlus } from 'lucide-react'
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
import type { TemplateCategory } from '@/types'

const categories: TemplateCategory[] = ['Reminder', 'Confirmation', 'Reschedule', 'Broadcast']
const languages = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu']

export function NewTemplateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addTemplate } = useClinicStore()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<TemplateCategory>('Reminder')
  const [language, setLanguage] = useState('English')
  const [body, setBody] = useState('')

  function reset() {
    setName('')
    setCategory('Reminder')
    setLanguage('English')
    setBody('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !body) {
      toast.error('Add a name and message body.')
      return
    }
    try {
      await addTemplate({ name, category, language, body })
      toast.success('Template submitted for Meta approval', {
        description: 'New WhatsApp templates must be pre-approved before use.',
      })
      onOpenChange(false)
      reset()
    } catch {
      toast.error('Could not submit the template', { description: 'Please try again.' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="h-4 w-4" />
            New message template
          </DialogTitle>
          <DialogDescription>
            Business-initiated WhatsApp messages must use a pre-approved template.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Template name</Label>
            <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Post-op Check-in" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-body">Message body</Label>
            <Textarea id="tpl-body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Hi {{patient_name}}, …" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit for approval</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
