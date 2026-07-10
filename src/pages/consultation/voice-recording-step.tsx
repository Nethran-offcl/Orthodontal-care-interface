import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, PenLine, Square, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const BAR_COUNT = 32

export function VoiceRecordingStep({
  patientFirstName,
  onComplete,
  onManualEntry,
}: {
  patientFirstName: string
  onComplete: () => void
  onManualEntry: () => void
}) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const barDelays = useMemo(() => Array.from({ length: BAR_COUNT }, () => Math.random() * 0.8), [])

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  function startRecording() {
    setElapsed(0)
    setStatus('recording')
  }

  function stopRecording() {
    setStatus('transcribing')
    window.setTimeout(() => {
      onComplete()
    }, 1500)
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-14 text-center">
        {status === 'transcribing' ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">Transcribing &amp; structuring the note…</p>
              <p className="mt-1 text-xs text-muted-foreground">Speech-to-text, then mapping into chart fields.</p>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={status === 'recording' ? stopRecording : startRecording}
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full transition-colors',
                status === 'recording'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
              aria-label={status === 'recording' ? 'Stop recording' : 'Start recording'}
            >
              {status === 'recording' ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
            </button>

            <div>
              <p className="text-sm font-medium">
                {status === 'recording' ? `Recording — ${mm}:${ss}` : `Ready to record ${patientFirstName}'s visit`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {status === 'recording'
                  ? 'Speak naturally — diagnosis, procedure, and any medication.'
                  : 'Tap the mic and dictate your findings after the exam.'}
              </p>
            </div>

            <div className="flex h-10 items-end gap-[3px]">
              {barDelays.map((delay, i) => (
                <span
                  key={i}
                  className={cn(
                    'w-[3px] rounded-full bg-primary/70',
                    status === 'recording' ? 'animate-wave-pulse' : 'h-1.5 opacity-30',
                  )}
                  style={
                    status === 'recording'
                      ? { animationDelay: `${delay}s`, height: '100%' }
                      : undefined
                  }
                />
              ))}
            </div>

            {status === 'idle' && (
              <button
                onClick={onManualEntry}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <PenLine className="h-3.5 w-3.5" />
                Type the chart entry manually instead
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
