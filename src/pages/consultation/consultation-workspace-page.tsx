import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ImageIcon,
  Mic,
  Pill,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { VoiceRecordingStep } from '@/pages/consultation/voice-recording-step'
import { TranscriptReviewStep } from '@/pages/consultation/transcript-review-step'
import { PrescriptionStep } from '@/pages/consultation/prescription-step'
import { TreatmentPlanTab } from '@/pages/patients/tabs/treatment-plan-tab'
import { ImagesTab } from '@/pages/patients/tabs/images-tab'
import { generateStructuredChart } from '@/pages/consultation/mock-transcript'
import type { StructuredChart } from '@/pages/consultation/mock-transcript'
import { useClinicStore } from '@/state/store'
import { getDoctor } from '@/data'
import { daysFromToday } from '@/data/dates'
import { cn, formatCurrency } from '@/lib/utils'

const STEPS = [
  { key: 'record', label: 'Record', icon: Mic },
  { key: 'review', label: 'Transcribe', icon: Sparkles },
  { key: 'prescription', label: 'Prescribe', icon: Pill },
  { key: 'plan', label: 'Treatment plan', icon: ClipboardList },
  { key: 'photos', label: 'Photos', icon: ImageIcon },
] as const

export function ConsultationWorkspacePage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const navigate = useNavigate()
  const {
    appointments,
    patients,
    treatmentPlans,
    images,
    updateAppointmentStatus,
    addChartEntry,
    addPrescription,
  } = useClinicStore()

  const appointment = appointments.find((a) => a.id === appointmentId)
  const patient = appointment ? patients.find((p) => p.id === appointment.patientId) : undefined

  const [step, setStep] = useState(0)
  const [maxUnlocked, setMaxUnlocked] = useState(0)
  const [mode, setMode] = useState<'voice' | 'manual'>('voice')
  const [generated, setGenerated] = useState<{ transcript: string; structured: StructuredChart } | null>(null)
  const [chartEntryId, setChartEntryId] = useState<string | null>(null)

  if (!appointment || !patient) {
    return <Navigate to="/appointments" replace />
  }

  const doctor = getDoctor(appointment.doctorId)
  const firstName = patient.name.split(' ')[0]
  const myPlans = treatmentPlans.filter((t) => t.patientId === patient.id)
  const myImages = images.filter((i) => i.patientId === patient.id).sort((a, b) => a.date.localeCompare(b.date))

  function goTo(index: number) {
    if (index <= maxUnlocked) setStep(index)
  }

  function unlock(index: number) {
    setMaxUnlocked((m) => Math.max(m, index))
    setStep(index)
  }

  function handleRecordingComplete() {
    const result = generateStructuredChart(appointment!, patient!)
    setGenerated(result)
    setMode('voice')
    unlock(1)
  }

  function handleManualEntry() {
    setGenerated({
      transcript: '',
      structured: {
        toothArea: '',
        diagnosis: '',
        procedure: '',
        notes: '',
        followUpDays: null,
        suggestedMedicines: [],
      },
    })
    setMode('manual')
    unlock(1)
  }

  function handleChartConfirm(structured: StructuredChart) {
    const entry = addChartEntry({
      patientId: patient!.id,
      date: daysFromToday(0),
      doctorId: appointment!.doctorId,
      toothArea: structured.toothArea,
      diagnosis: structured.diagnosis,
      procedure: structured.procedure,
      notes: structured.notes,
      source: mode,
      transcript: mode === 'voice' ? generated?.transcript : undefined,
    })
    setChartEntryId(entry.id)
    toast.success('Chart entry saved')
    unlock(2)
  }

  function handlePrescriptionSave(medicines: { name: string; dosage: string; frequency: string; duration: string }[], notes: string) {
    addPrescription({
      patientId: patient!.id,
      chartEntryId: chartEntryId ?? undefined,
      date: daysFromToday(0),
      doctorId: appointment!.doctorId,
      medicines,
      notes,
    })
    toast.success('Prescription saved')
    unlock(3)
  }

  function finishConsultation() {
    updateAppointmentStatus(appointment!.id, 'completed')
    toast.success('Consultation completed', { description: `${patient!.name}'s chart has been updated.` })
    navigate(`/patients/${patient!.id}?tab=chart`)
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Exit consultation">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Consultation workspace</p>
          <h1 className="text-xl font-semibold">{appointment.reason}</h1>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
        <PatientAvatar id={patient.id} name={patient.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{patient.name}</p>
          <p className="text-xs text-muted-foreground">
            {patient.id} · {patient.age} yrs · with {doctor?.name}
          </p>
        </div>
        {patient.allergies.length > 0 && (
          <Badge variant="destructive" className="gap-1">
            <ShieldAlert className="h-3 w-3" />
            {patient.allergies.join(', ')}
          </Badge>
        )}
        {patient.balanceDue > 0 && <Badge variant="warning">{formatCurrency(patient.balanceDue)} due</Badge>}
      </div>

      <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const unlocked = i <= maxUnlocked
          const active = i === step
          const done = i < maxUnlocked || (i === maxUnlocked && i !== step)
          return (
            <button
              key={s.key}
              onClick={() => goTo(i)}
              disabled={!unlocked}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : unlocked
                    ? 'border-border bg-card text-foreground hover:bg-secondary'
                    : 'border-border bg-secondary/40 text-muted-foreground/50',
              )}
            >
              {done && !active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
              {s.label}
            </button>
          )
        })}
      </div>

      {step === 0 && (
        <VoiceRecordingStep
          patientFirstName={firstName}
          onComplete={handleRecordingComplete}
          onManualEntry={handleManualEntry}
        />
      )}

      {step === 1 && generated && (
        <TranscriptReviewStep
          mode={mode}
          transcript={generated.transcript}
          initial={generated.structured}
          onConfirm={handleChartConfirm}
        />
      )}

      {step === 2 && generated && (
        <PrescriptionStep
          initialMedicines={generated.structured.suggestedMedicines}
          diagnosis={generated.structured.diagnosis}
          onSave={handlePrescriptionSave}
          onSkip={() => unlock(3)}
        />
      )}

      {step === 3 && (
        <div>
          <TreatmentPlanTab patientId={patient.id} plans={myPlans} />
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => goTo(2)}>
              Back
            </Button>
            <Button onClick={() => unlock(4)}>Continue to photos</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <ImagesTab patientId={patient.id} images={myImages} />
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => goTo(3)}>
              Back
            </Button>
            <Button onClick={finishConsultation}>
              <CalendarClock className="h-4 w-4" />
              Finish consultation
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
