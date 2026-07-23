import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Columns2,
  ImageIcon,
  ImagePlus,
  MapPin,
  RotateCcw,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { UploadImageDialog } from '@/pages/patients/upload-image-dialog'
import { imagesService } from '@/services'
import { useClinicStore } from '@/state/store'
import { cn, formatDate } from '@/lib/utils'
import type { ImageCategory, PatientImage } from '@/types'

/** Fetches a time-limited signed URL for a private-bucket image and keeps it fresh per storage path. */
function useSignedImageUrl(storagePath: string) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setUrl(null)
    if (!storagePath) return
    imagesService
      .getSignedUrl(storagePath)
      .then((u) => {
        if (alive) setUrl(u)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [storagePath])

  return url
}

const categories: { value: ImageCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'before-after', label: 'Before / After' },
  { value: 'clinical', label: 'Clinical Photos' },
  { value: 'report', label: 'Reports' },
  { value: 'scan', label: 'Scans' },
  { value: 'xray', label: 'X-Rays' },
]

const categoryLabel: Record<ImageCategory, string> = {
  'before-after': 'Before / After',
  clinical: 'Clinical',
  report: 'Report',
  scan: 'Scan',
  xray: 'X-Ray',
}

function ImageTile({
  image,
  onClick,
  compareMode,
  checked,
  onToggleCheck,
}: {
  image: PatientImage
  onClick: () => void
  compareMode: boolean
  checked: boolean
  onToggleCheck: () => void
}) {
  const url = useSignedImageUrl(image.storagePath)
  return (
    <div className="group relative flex shrink-0 flex-col gap-1.5" style={{ width: 128 }}>
      <button
        onClick={compareMode ? onToggleCheck : onClick}
        className="text-left"
      >
        <div
          className={cn(
            'h-28 w-32 overflow-hidden rounded-lg border bg-secondary transition-transform group-hover:scale-[1.02]',
            checked ? 'border-primary ring-2 ring-primary' : 'border-border',
          )}
        >
          {url && <img src={url} alt={image.toothArea} className="h-full w-full object-cover" />}
        </div>
      </button>
      {compareMode && (
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggleCheck}
          className="absolute left-1.5 top-1.5 h-4 w-4 accent-primary"
        />
      )}
      <Badge variant="secondary" className="absolute right-1.5 top-1.5 text-[9px]">
        {categoryLabel[image.category]}
      </Badge>
      <p className="truncate text-[11px] text-muted-foreground">{formatDate(image.date, { day: 'numeric', month: 'short' })}</p>
    </div>
  )
}

function CompareTile({ image }: { image: PatientImage }) {
  const url = useSignedImageUrl(image.storagePath)
  return (
    <div className="space-y-2">
      <div className="h-56 w-full overflow-hidden rounded-lg border border-border bg-secondary">
        {url && <img src={url} alt={image.toothArea} className="h-full w-full object-cover" />}
      </div>
      <p className="text-xs font-medium">{formatDate(image.date)}</p>
      <p className="text-xs text-muted-foreground">{image.note}</p>
    </div>
  )
}

export function ImagesTab({ patientId, images }: { patientId: string; images: PatientImage[] }) {
  const { addImageAnnotation } = useClinicStore()
  const [selected, setSelected] = useState<PatientImage | null>(null)
  const selectedUrl = useSignedImageUrl(selected?.storagePath ?? '')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<ImageCategory | 'all'>('all')
  const [compareMode, setCompareMode] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [annotateMode, setAnnotateMode] = useState(false)
  const [pendingSpot, setPendingSpot] = useState<{ xPct: number; yPct: number } | null>(null)
  const [noteInput, setNoteInput] = useState('')

  const filtered = categoryFilter === 'all' ? images : images.filter((i) => i.category === categoryFilter)

  const groups = new Map<string, PatientImage[]>()
  for (const img of filtered) {
    const list = groups.get(img.toothArea) ?? []
    list.push(img)
    groups.set(img.toothArea, list)
  }

  function toggleCompare(id: string) {
    setCompareIds((ids) => {
      if (ids.includes(id)) return ids.filter((i) => i !== id)
      if (ids.length >= 2) return [ids[1], id]
      return [...ids, id]
    })
  }

  function openLightbox(img: PatientImage) {
    setSelected(img)
    setZoom(1)
    setAnnotateMode(false)
    setPendingSpot(null)
    setNoteInput('')
  }

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!annotateMode || !selected) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100
    setPendingSpot({ xPct, yPct })
  }

  async function saveAnnotation() {
    if (!selected || !pendingSpot || !noteInput.trim()) return
    try {
      await addImageAnnotation(selected.id, { xPct: pendingSpot.xPct, yPct: pendingSpot.yPct, note: noteInput.trim() })
      setPendingSpot(null)
      setNoteInput('')
      toast.success('Annotation added')
    } catch {
      toast.error('Could not save the annotation', { description: 'Please try again.' })
    }
  }

  const compareImages = compareIds.map((id) => images.find((i) => i.id === id)).filter(Boolean) as PatientImage[]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                categoryFilter === c.value
                  ? 'border-primary bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:bg-secondary/60',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {compareMode ? (
            <>
              <span className="text-xs text-muted-foreground">{compareIds.length}/2 selected</span>
              <Button size="sm" variant="outline" disabled={compareIds.length !== 2} onClick={() => setCompareOpen(true)}>
                <Columns2 className="h-3.5 w-3.5" />
                Compare
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setCompareMode(false); setCompareIds([]) }}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setCompareMode(true)}>
              <Columns2 className="h-3.5 w-3.5" />
              Compare
            </Button>
          )}
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <ImagePlus className="h-4 w-4" />
            Add photo
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-5 w-5" />}
          title="No photos in this category"
          description="Photos taken during treatment will appear here, grouped by tooth or area."
        />
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([area, imgs]) => (
            <div key={area}>
              <p className="mb-2 text-sm font-medium">{area}</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {imgs.map((img) => (
                  <ImageTile
                    key={img.id}
                    image={img}
                    onClick={() => openLightbox(img)}
                    compareMode={compareMode}
                    checked={compareIds.includes(img.id)}
                    onToggleCheck={() => toggleCompare(img.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.toothArea}</DialogTitle>
                <DialogDescription>
                  {formatDate(selected.date)} · {categoryLabel[selected.category]}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-1.5">
                <Button size="icon-sm" variant="outline" onClick={() => setZoom((z) => Math.min(2.5, z + 0.5))} aria-label="Zoom in">
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon-sm" variant="outline" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} aria-label="Zoom out">
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon-sm" variant="outline" onClick={() => setZoom(1)} aria-label="Reset zoom">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant={annotateMode ? 'default' : 'outline'}
                  onClick={() => { setAnnotateMode((a) => !a); setPendingSpot(null) }}
                  className="ml-auto"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {annotateMode ? 'Click image to pin' : 'Annotate'}
                </Button>
              </div>

              <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border bg-secondary">
                <div
                  onClick={handleImageClick}
                  className={cn('absolute inset-0 transition-transform', annotateMode && 'cursor-crosshair')}
                  style={{ transform: `scale(${zoom})` }}
                >
                  {selectedUrl && (
                    <img src={selectedUrl} alt={selected.toothArea} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  {selected.annotations.map((a, i) => (
                    <span
                      key={a.id}
                      title={a.note}
                      className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] font-semibold text-primary-foreground shadow"
                      style={{ left: `${a.xPct}%`, top: `${a.yPct}%` }}
                    >
                      {i + 1}
                    </span>
                  ))}
                  {pendingSpot && (
                    <span
                      className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-warning"
                      style={{ left: `${pendingSpot.xPct}%`, top: `${pendingSpot.yPct}%` }}
                    />
                  )}
                </div>
              </div>

              {pendingSpot && (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="What's at this spot?"
                    onKeyDown={(e) => e.key === 'Enter' && saveAnnotation()}
                  />
                  <Button size="sm" onClick={saveAnnotation} disabled={!noteInput.trim()}>
                    Add
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => setPendingSpot(null)} aria-label="Cancel">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {selected.annotations.length > 0 && (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {selected.annotations.map((a, i) => (
                    <li key={a.id}>
                      <span className="font-semibold text-foreground">{i + 1}.</span> {a.note}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-sm text-foreground">{selected.note}</p>
              <Badge variant={selected.marketingConsent ? 'success' : 'secondary'} className="w-fit">
                <ShieldCheck className="h-3 w-3" />
                {selected.marketingConsent ? 'Marketing consent on file' : 'Clinical record only'}
              </Badge>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Compare */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compare photos</DialogTitle>
            <DialogDescription>Side by side, oldest on the left.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {[...compareImages].sort((a, b) => a.date.localeCompare(b.date)).map((img) => (
              <CompareTile key={img.id} image={img} />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <UploadImageDialog patientId={patientId} open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
