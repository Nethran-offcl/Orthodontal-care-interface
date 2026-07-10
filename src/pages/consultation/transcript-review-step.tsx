import { useState } from 'react'
import { CheckCircle2, Mic, PenLine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { StructuredChart } from '@/pages/consultation/mock-transcript'

export function TranscriptReviewStep({
  mode,
  transcript,
  initial,
  onConfirm,
}: {
  mode: 'voice' | 'manual'
  transcript?: string
  initial: StructuredChart
  onConfirm: (structured: StructuredChart) => void
}) {
  const [toothArea, setToothArea] = useState(initial.toothArea)
  const [diagnosis, setDiagnosis] = useState(initial.diagnosis)
  const [procedure, setProcedure] = useState(initial.procedure)
  const [notes, setNotes] = useState(initial.notes)

  return (
    <div className={mode === 'voice' ? 'grid grid-cols-1 gap-5 lg:grid-cols-2' : ''}>
      {mode === 'voice' && transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mic className="h-4 w-4 text-primary" />
              Voice transcript
            </CardTitle>
            <CardDescription>What was said, word for word.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="rounded-lg bg-secondary/50 p-4 text-sm italic leading-relaxed text-foreground">
              "{transcript}"
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <PenLine className="h-4 w-4 text-primary" />
            {mode === 'voice' ? 'Structured chart fields' : 'Chart entry'}
          </CardTitle>
          <CardDescription>
            {mode === 'voice'
              ? 'Mapped automatically from the transcript — review and correct before saving.'
              : 'Enter the findings from this visit.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="tooth-area">Tooth / area</Label>
            <Input id="tooth-area" value={toothArea} onChange={(e) => setToothArea(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="procedure">Procedure</Label>
            <Input id="procedure" value={procedure} onChange={(e) => setProcedure(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>
          <Button
            className="w-full"
            onClick={() => onConfirm({ ...initial, toothArea, diagnosis, procedure, notes })}
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm &amp; save to chart
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
