import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { AppointmentsPage } from '@/pages/appointments/appointments-page'
import { PatientsListPage } from '@/pages/patients/patients-list-page'
import { PatientProfilePage } from '@/pages/patients/patient-profile-page'
import { ConsultationWorkspacePage } from '@/pages/consultation/consultation-workspace-page'
import { MessagingLayout } from '@/pages/messaging/messaging-layout'
import { InboxPage } from '@/pages/messaging/inbox-page'
import { ReminderQueuePage } from '@/pages/messaging/reminder-queue-page'
import { BroadcastsPage } from '@/pages/messaging/broadcasts-page'
import { TemplatesPage } from '@/pages/messaging/templates-page'
import { BillingPage } from '@/pages/billing/billing-page'
import { ReportsPage } from '@/pages/reports/reports-page'
import { SettingsPage } from '@/pages/settings/settings-page'
import { NotFoundPage } from '@/pages/not-found-page'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="patients" element={<PatientsListPage />} />
        <Route path="patients/:id" element={<PatientProfilePage />} />
        <Route path="consultation/:appointmentId" element={<ConsultationWorkspacePage />} />
        <Route path="messaging" element={<MessagingLayout />}>
          <Route index element={<InboxPage />} />
          <Route path="reminders" element={<ReminderQueuePage />} />
          <Route path="broadcasts" element={<BroadcastsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
        </Route>
        <Route path="billing" element={<BillingPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/404" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
