import { useState } from 'react'
import { ImageIcon, ImagePlus, ShieldCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { UploadImageDialog } from '@/pages/patients/upload-image-dialog'
import { useAppState } from '@/state/app-state'
import { formatDate } from '@/lib/utils'
import type { PatientImage } from '@/data/types'

function ImageTile({ image, onClick }: { image: PatientImage; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex shrink-0 flex-col gap-1.5 text-left"
      style={{ width: 128 }}
    >
      <div
        className="h-28 w-32 rounded-lg border border-border transition-transform group-hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, hsl(${image.hue} 55% 88%), hsl(${image.hue} 45% 62%))`,
        }}
      />
      <p className="truncate text-[11px] text-muted-foreground">{formatDate(image.date, { day: 'numeric', month: 'short' })}</p>
    </button>
  )
}

export function ImagesTab({ patientId, images }: { patientId: string; images: PatientImage[] }) {
  const { role } = useAppState()
  const [selected, setSelected] = useState<PatientImage | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const canUpload = role !== 'patient'

  const groups = new Map<string, PatientImage[]>()
  for (const img of images) {
    const list = groups.get(img.toothArea) ?? []
    list.push(img)
    groups.set(img.toothArea, list)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Grouped by tooth or area, oldest to newest — easy to compare over time.</p>
        {canUpload && (
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <ImagePlus className="h-4 w-4" />
            Add photo
          </Button>
        )}
      </div>

      {images.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-5 w-5" />}
          title="No treatment photos yet"
          description="Photos taken during treatment will appear here, grouped by tooth or area."
        />
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([area, imgs]) => (
            <div key={area}>
              <p className="mb-2 text-sm font-medium">{area}</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {imgs.map((img) => (
                  <ImageTile key={img.id} image={img} onClick={() => setSelected(img)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.toothArea}</DialogTitle>
                <DialogDescription>{formatDate(selected.date)}</DialogDescription>
              </DialogHeader>
              <div
                className="h-52 w-full rounded-lg border border-border"
                style={{
                  background: `linear-gradient(135deg, hsl(${selected.hue} 55% 88%), hsl(${selected.hue} 45% 62%))`,
                }}
              />
              <p className="text-sm text-foreground">{selected.note}</p>
              <Badge variant={selected.marketingConsent ? 'success' : 'secondary'} className="w-fit">
                <ShieldCheck className="h-3 w-3" />
                {selected.marketingConsent ? 'Marketing consent on file' : 'Clinical record only'}
              </Badge>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UploadImageDialog patientId={patientId} open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
