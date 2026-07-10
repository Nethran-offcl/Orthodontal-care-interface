import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CalendarPlus, Mic, PenSquare } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PatientAvatar } from '@/components/shared/patient-avatar'
import { Badge } from '@/components/ui/badge'
import { EditPatientDialog } from '@/pages/patients/edit-patient-dialog'
import { NewAppointmentDialog } from '@/pages/appointments/new-appointment-dialog'
import { OverviewTab } from '@/pages/patients/tabs/overview-tab'
import { ChartHistoryTab } from '@/pages/patients/tabs/chart-history-tab'
import { TreatmentPlanTab } from '@/pages/patients/tabs/treatment-plan-tab'
import { ImagesTab } from '@/pages/patients/tabs/images-tab'
import { InvoicesTab } from '@/pages/patients/tabs/invoices-tab'
import { CommunicationLogTab } from '@/pages/patients/tabs/communication-log-tab'
import { useAppState } from '@/state/app-state'
import { useClinicStore } from '@/state/store'
import { formatCurrency } from '@/lib/utils'

export function PatientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { role } = useAppState()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    patients,
    appointments,
    treatmentPlans,
    chartEntries,
    prescriptions,
    images,
    invoices,
    conversations,
  } = useClinicStore()

  const [editOpen, setEditOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)

  if (role === 'patient') return <Navigate to="/" replace />

  const patient = patients.find((p) => p.id === id)
  if (!patient) {
    return <Navigate to="/patients" replace />
  }

  const myAppointments = appointments.filter((a) => a.patientId === patient.id)
  const myPlans = treatmentPlans.filter((t) => t.patientId === patient.id)
  const myChart = chartEntries
    .filter((c) => c.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const myPrescriptions = prescriptions.filter((p) => p.patientId === patient.id)
  const myImages = images.filter((i) => i.patientId === patient.id).sort((a, b) => a.date.localeCompare(b.date))
  const myInvoices = invoices
    .filter((i) => i.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const conversation = conversations.find((c) => c.patientId === patient.id)

  const activeAppointment = myAppointments.find(
    (a) => a.status === 'confirmed' || a.status === 'checked-in',
  )

  const tab = searchParams.get('tab') ?? 'overview'

  function setTab(value: string) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', value)
    setSearchParams(next, { replace: true })
  }

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Patients', to: '/patients' }, { label: patient.name }]}
        title={patient.name}
        description={`${patient.id} · ${patient.age} yrs · ${patient.phone}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <PenSquare className="h-4 w-4" />
              Update
            </Button>
            <Button variant="outline" onClick={() => setBookOpen(true)}>
              <CalendarPlus className="h-4 w-4" />
              Book appointment
            </Button>
            {activeAppointment && (
              <Button onClick={() => navigate(`/consultation/${activeAppointment.id}`)}>
                <Mic className="h-4 w-4" />
                Start consultation
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <PatientAvatar id={patient.id} name={patient.name} size="lg" />
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{patient.leadSource}</Badge>
          <Badge variant={patient.balanceDue > 0 ? 'warning' : 'success'}>
            {patient.balanceDue > 0 ? `${formatCurrency(patient.balanceDue)} due` : 'Account settled'}
          </Badge>
          {patient.marketingConsent && <Badge variant="accent">Marketing consent</Badge>}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chart">Chart &amp; History</TabsTrigger>
          <TabsTrigger value="plan">Treatment Plan</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="log">Communication Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab patient={patient} appointments={myAppointments} />
        </TabsContent>
        <TabsContent value="chart">
          <ChartHistoryTab entries={myChart} prescriptions={myPrescriptions} />
        </TabsContent>
        <TabsContent value="plan">
          <TreatmentPlanTab patientId={patient.id} plans={myPlans} />
        </TabsContent>
        <TabsContent value="images">
          <ImagesTab patientId={patient.id} images={myImages} />
        </TabsContent>
        <TabsContent value="invoices">
          <InvoicesTab invoices={myInvoices} />
        </TabsContent>
        <TabsContent value="log">
          <CommunicationLogTab patientId={patient.id} conversation={conversation} />
        </TabsContent>
      </Tabs>

      <EditPatientDialog patient={patient} open={editOpen} onOpenChange={setEditOpen} />
      <NewAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} defaultPatientId={patient.id} />
    </div>
  )
}
