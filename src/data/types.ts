export type Role = 'doctor' | 'frontdesk' | 'patient'

export interface Doctor {
  id: string
  name: string
  title: string
  registrationNo: string
  specialty: string
  phone: string
  email: string
  color: string
}

export type LeadSource = 'Walk-in' | 'Referral' | 'Instagram' | 'Facebook' | 'Google'

export interface Patient {
  id: string
  name: string
  phone: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  address: string
  leadSource: LeadSource
  registeredOn: string
  allergies: string[]
  marketingConsent: boolean
  profileCompleteness: number
  balanceDue: number
  totalBilled: number
  primaryDoctorId: string
}

export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'checked-in'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  startTime: string
  durationMin: number
  status: AppointmentStatus
  reason: string
  notes?: string
  isFollowUp: boolean
  treatmentPlanId?: string
}

export type TreatmentStageStatus = 'planned' | 'in-progress' | 'completed'

export interface TreatmentStage {
  id: string
  label: string
  targetDate: string
  status: TreatmentStageStatus
  cost: number
  notes?: string
}

export interface TreatmentPlan {
  id: string
  patientId: string
  title: string
  createdOn: string
  createdByDoctorId: string
  stages: TreatmentStage[]
  status: 'active' | 'completed'
}

export interface ChartEntry {
  id: string
  patientId: string
  date: string
  doctorId: string
  toothArea: string
  diagnosis: string
  procedure: string
  notes: string
  source: 'voice' | 'manual'
  transcript?: string
}

export interface PrescriptionMedicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export interface Prescription {
  id: string
  patientId: string
  chartEntryId?: string
  date: string
  doctorId: string
  medicines: PrescriptionMedicine[]
  notes: string
}

export interface PatientImage {
  id: string
  patientId: string
  toothArea: string
  note: string
  date: string
  marketingConsent: boolean
  hue: number
}

export interface InvoiceItem {
  label: string
  amount: number
}

export type InvoiceStatus = 'paid' | 'pending' | 'partial'

export interface Invoice {
  id: string
  patientId: string
  date: string
  items: InvoiceItem[]
  total: number
  paid: number
  status: InvoiceStatus
}

export type MessageSender = 'clinic' | 'patient'

export interface ChatMessage {
  id: string
  sender: MessageSender
  text: string
  time: string
  status?: 'sent' | 'delivered' | 'read' | 'failed'
}

export interface Conversation {
  id: string
  patientId: string
  messages: ChatMessage[]
  lastMessageAt: string
  unread: number
  slaMinutes: number
}

export type ReminderStatus = 'scheduled' | 'sent' | 'confirmed' | 'no-response' | 'rescheduled'

export interface Reminder {
  id: string
  patientId: string
  appointmentId: string
  treatmentPlanId?: string
  dueDate: string
  status: ReminderStatus
  sentAt?: string
}

export type BroadcastStatus =
  | 'draft'
  | 'pending-approval'
  | 'approved'
  | 'scheduled'
  | 'sent'
  | 'rejected'

export interface Broadcast {
  id: string
  title: string
  message: string
  audience: string
  audienceCount: number
  status: BroadcastStatus
  createdBy: string
  createdAt: string
  scheduledFor?: string
  sentAt?: string
  deliveredCount?: number
  readCount?: number
  reviewNote?: string
}

export type TemplateCategory = 'Reminder' | 'Confirmation' | 'Reschedule' | 'Broadcast'

export interface MessageTemplate {
  id: string
  name: string
  category: TemplateCategory
  body: string
  approvalStatus: 'approved' | 'pending'
  language: string
  usedCount: number
}

export interface AuditLogEntry {
  id: string
  actor: string
  action: string
  target: string
  time: string
}

export type NotificationType = 'reminder' | 'payment' | 'message' | 'system' | 'broadcast'

export interface AppNotification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: NotificationType
  href?: string
}
