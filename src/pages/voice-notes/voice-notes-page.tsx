import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mic } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/shared/empty-state'
import { VoiceRecordingStep } from '@/pages/consultation/voice-recording-step'
import { TranscriptReviewStep } from '@/pages/consultation/transcript-review-step'
import { voiceService, voiceNotesService } from '@/services'
import type { StructuredChart, VoiceNote } from '@/services'
import { useAuth } from '@/state/auth-state'
import { useClinicStore } from '@/state/store'
import { daysFromToday } from '@/lib/date'
import { formatRelativeTime } from '@/lib/utils'

const emptyStructured: StructuredChart = {
  toothArea: '',
  diagnosis: '',
  procedure: '',
  notes: '',
  followUpDays: null,
  suggestedMedicines: [],
}

export function VoiceNotesPage() {
  const { userId } = useAuth()
  const { patients, addChartEntry } = useClinicStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<'record' | 'review'>('record')
  const [transcript, setTranscript] = useState('')
  const [structured, setStructured] = useState<StructuredChart>(emptyStructured)
  const [patientId, setPatientId] = useState('')
  const [personalNotes, setPersonalNotes] = useState<VoiceNote[]>([])

  useEffect(() => {
    if (!userId) return
    voiceNotesService.getAllForDoctor(userId).then(setPersonalNotes)
  }, [userId])

  async function handleRecordingComplete(t: string) {
    setTranscript(t)
    try {
      const result = await voiceService.generateStructuredChart(t)
      setStructured(result)
    } catch {
      toast.error('Could not structure the note', {
        description: 'The transcript was captured — fill in the fields manually below.',
      })
      setStructured(emptyStructured)
    }
    setStep('review')
  }

  async function handleConfirm(finalStructured: StructuredChart) {
    if (patientId) {
      await addChartEntry({
        patientId,
        date: daysFromToday(0),
        doctorId: userId ?? '',
        toothArea: finalStructured.toothArea,
        diagnosis: finalStructured.diagnosis,
        procedure: finalStructured.procedure,
        notes: finalStructured.notes,
        source: 'voice',
        transcript,
      })
      toast.success('Voice note saved to chart')
      navigate(`/patients/${patientId}?tab=chart`)
      return
    }

    const saved = await voiceNotesService.create(userId ?? '', transcript, finalStructured)
    setPersonalNotes((prev) => [saved, ...prev])
    toast.success('Voice note saved', { description: "Kept as your personal note — it isn't attached to any patient." })
    setStep('record')
    setTranscript('')
    setStructured(emptyStructured)
    setPatientId('')
  }

  return (
    <div>
      <PageHeader
        title="Voice Notes"
        description="Record a quick note between visits — file it against a patient, or keep it as your own personal note."
      />

      {step === 'record' && (
        <div className="space-y-6">
          <VoiceRecordingStep onComplete={handleRecordingComplete} />

          <div>
            <h2 className="mb-3 text-sm font-semibold">Your personal notes</h2>
            {personalNotes.length === 0 ? (
              <EmptyState
                icon={<Mic className="h-5 w-5" />}
                title="No personal notes yet"
                description="Notes you record without picking a patient will show up here."
              />
            ) : (
              <div className="space-y-3">
                {personalNotes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-center justify-between gap-2">
                        {note.diagnosis ? (
                          <p className="text-sm font-medium">{note.diagnosis}</p>
                        ) : (
                          <p className="text-sm font-medium text-muted-foreground">Untitled note</p>
                        )}
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(note.createdAt)}
                        </span>
                      </div>
                      {note.procedure && <p className="text-xs text-muted-foreground">{note.procedure}</p>}
                      <p className="rounded-lg bg-secondary/40 p-3 text-xs italic leading-relaxed text-muted-foreground">
                        "{note.transcript}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Who is this note about?</CardTitle>
              <CardDescription>
                Optional — pick a patient to file this into their chart, or leave it blank to keep it as your own
                note.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm space-y-1.5">
                <Label>Patient (optional)</Label>
                <Select value={patientId} onValueChange={(v) => setPatientId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No specific patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific patient</SelectItem>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <TranscriptReviewStep mode="voice" transcript={transcript} initial={structured} onConfirm={handleConfirm} />
        </div>
      )}
    </div>
  )
}
