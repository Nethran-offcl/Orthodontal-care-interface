import { useState } from 'react'
import { HeartPulse, Pill, ShieldAlert, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EditMedicalHistoryDialog } from '@/pages/patients/edit-medical-history-dialog'
import type { Patient } from '@/types'

export function MedicalHistoryTab({ patient }: { patient: Patient }) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          Edit history
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className={patient.allergies.length > 0 ? 'border-destructive/25 bg-destructive/5' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.allergies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No known allergies on file.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((a) => (
                  <Badge key={a} variant="destructive">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <HeartPulse className="h-4 w-4 text-primary" />
              Medical conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(patient.medicalConditions?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No medical conditions on file.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {patient.medicalConditions!.map((c) => (
                  <Badge key={c} variant="secondary">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Pill className="h-4 w-4 text-primary" />
              Current medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(patient.currentMedications?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No medications on file.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {patient.currentMedications!.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-primary" />
              Dental history notes
            </CardTitle>
            <CardDescription>Free-text context worth knowing before treatment.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {patient.dentalHistoryNotes || 'No dental history notes yet.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <EditMedicalHistoryDialog patient={patient} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
