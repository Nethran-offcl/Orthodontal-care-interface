import { ImagePlus } from 'lucide-react'
import { ComingSoonPage } from '@/pages/shared/coming-soon-page'

export function ImageUploadPage() {
  return (
    <ComingSoonPage
      icon={<ImagePlus className="h-6 w-6" />}
      title="Image Upload"
      tagline="A standalone photo intake queue, outside a patient's profile."
      description="A dedicated bulk-upload queue for treatment photos is coming next. Today, photos are already added directly from a patient's Images tab."
      bullets={[
        'Bulk-upload photos and sort them to patients afterwards',
        'Auto-group by tooth or area using AI',
        'Available today: uploads from a patient’s Images tab',
      ]}
      ctaLabel="Go to patients"
      ctaTo="/patients"
    />
  )
}
