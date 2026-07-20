import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Camera, ImagePlus } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { daysFromToday } from '@/lib/date'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import type { ImageCategory } from '@/types'

const categoryOptions: { value: ImageCategory; label: string }[] = [
  { value: 'clinical', label: 'Clinical Photo' },
  { value: 'before-after', label: 'Before / After' },
  { value: 'xray', label: 'X-Ray' },
  { value: 'scan', label: 'Scan' },
  { value: 'report', label: 'Report' },
]

export function UploadImageDialog({
  patientId,
  open,
  onOpenChange,
}: {
  patientId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { addImage } = useClinicStore()
  const { role, userId } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toothArea, setToothArea] = useState('')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState<ImageCategory>('clinical')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function reset() {
    setToothArea('')
    setNote('')
    setCategory('clinical')
    setMarketingConsent(false)
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!toothArea || !file) {
      toast.error('Choose a photo and tag the tooth or area first.')
      return
    }
    setSubmitting(true)
    try {
      await addImage(
        {
          patientId,
          toothArea,
          note: note || 'Treatment photo',
          date: daysFromToday(0),
          marketingConsent,
          category,
          annotations: [],
          uploadedByDoctorId: role === 'doctor' ? (userId ?? undefined) : undefined,
        },
        file,
      )
      toast.success('Photo added to patient record')
      onOpenChange(false)
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Add treatment photo
          </DialogTitle>
          <DialogDescription>Stored with this visit's chart entry, timestamped automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected upload preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <Camera className="h-6 w-6" />
                <span className="text-xs font-medium">Tap to choose a photo</span>
              </>
            )}
          </button>
          {previewUrl && (
            <p className="-mt-2 text-center text-xs text-muted-foreground">Tap the photo above to choose a different one</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="img-area">Tooth / area</Label>
            <Input id="img-area" value={toothArea} onChange={(e) => setToothArea(e.target.value)} placeholder="e.g. 36 (Lower Left Molar)" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ImageCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="img-note">Note</Label>
            <Textarea id="img-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="What does this photo show?" />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={marketingConsent} onCheckedChange={(v) => setMarketingConsent(v === true)} className="mt-0.5" />
            <span>
              Marketing consent given
              <span className="block text-xs text-muted-foreground">Separate from this clinical record — only for social/marketing reuse.</span>
            </span>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Uploading…' : 'Save to record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
