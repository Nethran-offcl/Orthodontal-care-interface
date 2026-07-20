import { Link } from 'react-router-dom'
import { CalendarCheck2, MapPin, ShieldAlert, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatTile } from '@/components/shared/stat-tile'
import { useClinicStore } from '@/state/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Appointment, Patient } from '@/types'

export function OverviewTab({ patient, appointments }: { patient: Patient; appointments: Appointment[] }) {
  const { doctors } = useClinicStore()
  const doctor = doctors.find((d) => d.id === patient.primaryDoctorId)
  const sorted = [...appointments].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  const upcoming = sorted.filter((a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'checked-in')
  const past = [...sorted].filter((a) => a.status === 'completed').reverse()
  const nextVisit = upcoming[0]
  const lastVisit = past[0]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Next visit"
          value={nextVisit ? formatDate(nextVisit.date, { day: 'numeric', month: 'short' }) : '—'}
          icon={<CalendarCheck2 className="h-4 w-4" />}
        />
        <StatTile
          label="Last visit"
          value={lastVisit ? formatDate(lastVisit.date, { day: 'numeric', month: 'short' }) : '—'}
        />
        <StatTile
          label="Balance due"
          value={formatCurrency(patient.balanceDue)}
          trend={patient.balanceDue > 0 ? 'Outstanding' : 'Settled'}
          trendTone={patient.balanceDue > 0 ? 'negative' : 'positive'}
        />
        <StatTile label="Total billed" value={formatCurrency(patient.totalBilled)} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patient details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patient ID</span>
              <span className="font-medium">{patient.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{patient.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age / Gender</span>
              <span className="font-medium">{patient.age} · {patient.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary doctor</span>
              <span className="font-medium">{doctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registered</span>
              <span className="font-medium">{formatDate(patient.registeredOn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lead source</span>
              <span className="font-medium">{patient.leadSource}</span>
            </div>
            {patient.address && (
              <div className="flex items-start justify-between gap-3 pt-1">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Address
                </span>
                <span className="text-right font-medium">{patient.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {patient.allergies.length > 0 ? (
          <Card className="border-destructive/25 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-destructive">
                <ShieldAlert className="h-4 w-4" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {patient.allergies.map((a) => (
                <Badge key={a} variant="destructive">
                  {a}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Billing snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total billed</span>
                <span className="font-medium tabular">{formatCurrency(patient.totalBilled)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance due</span>
                <span className={`font-semibold tabular ${patient.balanceDue > 0 ? 'text-warning' : 'text-success'}`}>
                  {formatCurrency(patient.balanceDue)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {patient.profileCompleteness < 100 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Profile {patient.profileCompleteness}% complete
              </CardTitle>
              <CardDescription>Add address and consent details when there's downtime.</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={patient.profileCompleteness} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Consent</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {patient.marketingConsent ? (
                <Link to="/settings" className="hover:underline">
                  Marketing consent on file
                </Link>
              ) : (
                'No marketing consent on file.'
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
