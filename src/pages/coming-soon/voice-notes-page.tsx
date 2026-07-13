import { Mic } from 'lucide-react'
import { ComingSoonPage } from '@/pages/shared/coming-soon-page'

export function VoiceNotesPage() {
  return (
    <ComingSoonPage
      icon={<Mic className="h-6 w-6" />}
      title="Voice Notes"
      tagline="Standalone voice memos, outside of a consultation."
      description="A dedicated space for quick voice notes between visits is on the way. Today, voice recording already works inside a consultation — start one from Today's Patients."
      bullets={[
        'Record a note without opening a specific patient',
        'Auto-transcribe and file it against a patient later',
        'Available today: record during a live consultation',
      ]}
      ctaLabel="Go to today's patients"
      ctaTo="/today"
    />
  )
}
