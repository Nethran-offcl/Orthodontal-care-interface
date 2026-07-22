import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { useAuth } from '@/state/auth-state'
import { LandingPage } from '@/pages/marketing/landing-page'
import { LoginPage } from '@/pages/auth/login-page'
import { SignupPage } from '@/pages/auth/signup-page'
import { PendingApprovalPage } from '@/pages/auth/pending-approval-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { TodayPatientsPage } from '@/pages/today/today-patients-page'
import { AppointmentsPage } from '@/pages/appointments/appointments-page'
import { PrescriptionsPage } from '@/pages/prescriptions/prescriptions-page'
import { TreatmentPlansPage } from '@/pages/treatment-plans/treatment-plans-page'
import { PatientTimelinePage } from '@/pages/timeline/patient-timeline-page'
import { PatientsListPage } from '@/pages/patients/patients-list-page'
import { PatientProfilePage } from '@/pages/patients/patient-profile-page'
import { ConsultationWorkspacePage } from '@/pages/consultation/consultation-workspace-page'
import { MessagingLayout } from '@/pages/messaging/messaging-layout'
import { InboxPage } from '@/pages/messaging/inbox-page'
import { ReminderQueuePage } from '@/pages/messaging/reminder-queue-page'
import { BroadcastsPage } from '@/pages/messaging/broadcasts-page'
import { EscalationsPage } from '@/pages/messaging/escalations-page'
import { TemplatesPage } from '@/pages/messaging/templates-page'
import { BookingPage } from '@/pages/booking/booking-page'
import { BillingPage } from '@/pages/billing/billing-page'
import { ReportsPage } from '@/pages/reports/reports-page'
import { SettingsPage } from '@/pages/settings/settings-page'
import { VoiceNotesPage } from '@/pages/voice-notes/voice-notes-page'
import { AiChartingPage } from '@/pages/ai-charting/ai-charting-page'
import { AiReceptionistPage } from '@/pages/ai-receptionist/ai-receptionist-page'
import { ImageUploadPage } from '@/pages/coming-soon/image-upload-page'
import { AdminDoctorsPage } from '@/pages/admin/doctors-page'
import { AdminReceptionistsPage } from '@/pages/admin/receptionists-page'
import { AdminUsersPage } from '@/pages/admin/users-page'
import { AdminRolesPage } from '@/pages/admin/roles-page'
import { AdminAnalyticsPage } from '@/pages/admin/analytics-page'
import { AdminAuditLogsPage } from '@/pages/admin/audit-logs-page'
import { AdminAiSettingsPage } from '@/pages/admin/ai-settings-page'
import { NotFoundPage } from '@/pages/not-found-page'

function App() {
  const { isAuthenticated, isPending } = useAuth()

  if (isPending) {
    return (
      <Routes>
        <Route path="*" element={<PendingApprovalPage />} />
      </Routes>
    )
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/signup" element={<Navigate to="/" replace />} />
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="today" element={<TodayPatientsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="treatment-plans" element={<TreatmentPlansPage />} />
        <Route path="timeline" element={<PatientTimelinePage />} />
        <Route path="patients" element={<PatientsListPage />} />
        <Route path="patients/:id" element={<PatientProfilePage />} />
        <Route path="consultation/:appointmentId" element={<ConsultationWorkspacePage />} />
        <Route path="messaging" element={<MessagingLayout />}>
          <Route index element={<InboxPage />} />
          <Route path="reminders" element={<ReminderQueuePage />} />
          <Route path="broadcasts" element={<BroadcastsPage />} />
          <Route path="escalations" element={<EscalationsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
        </Route>
        <Route path="booking" element={<BookingPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        <Route path="voice-notes" element={<VoiceNotesPage />} />
        <Route path="ai-charting" element={<AiChartingPage />} />
        <Route path="ai-receptionist" element={<AiReceptionistPage />} />
        <Route path="image-upload" element={<ImageUploadPage />} />

        <Route path="admin/doctors" element={<AdminDoctorsPage />} />
        <Route path="admin/receptionists" element={<AdminReceptionistsPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/roles" element={<AdminRolesPage />} />
        <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="admin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="admin/ai-settings" element={<AdminAiSettingsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
