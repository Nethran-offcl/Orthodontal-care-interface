export type Role = 'doctor' | 'receptionist' | 'admin'

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

export interface StaffMember {
  id: string
  name: string
  title: string
  phone: string
  email: string
  role: 'receptionist' | 'admin'
  status: 'active' | 'invited'
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
  medicalConditions?: string[]
  currentMedications?: string[]
  dentalHistoryNotes?: string
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

export type ImageCategory = 'before-after' | 'clinical' | 'report' | 'scan' | 'xray'

export interface ImageAnnotation {
  id: string
  xPct: number
  yPct: number
  note: string
}

export interface PatientImage {
  id: string
  patientId: string
  toothArea: string
  note: string
  date: string
  marketingConsent: boolean
  category: ImageCategory
  annotations: ImageAnnotation[]
  storagePath: string
  uploadedByDoctorId?: string
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

export type ConversationChannel = 'whatsapp' | 'instagram' | 'facebook' | 'email'
export type ConversationStatus = 'open' | 'pending' | 'waiting' | 'resolved'
export type ConversationPriority = 'low' | 'medium' | 'high'

export interface InternalNote {
  id: string
  author: string
  text: string
  time: string
}

export interface Attachment {
  id: string
  name: string
  kind: 'image' | 'document' | 'audio'
  sizeKb: number
  time: string
}

export interface Conversation {
  id: string
  patientId: string
  messages: ChatMessage[]
  lastMessageAt: string
  unread: number
  slaMinutes: number
  channel: ConversationChannel
  status: ConversationStatus
  assigneeId?: string
  priority?: ConversationPriority
  internalNotes: InternalNote[]
  attachments: Attachment[]
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

export type EscalationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type EscalationStatus = 'open' | 'in-progress' | 'resolved'

export interface EscalationComment {
  id: string
  author: string
  text: string
  time: string
}

export interface EscalationHistoryEntry {
  id: string
  action: string
  actor: string
  time: string
}

export interface Escalation {
  id: string
  conversationId?: string
  patientId: string
  reason: string
  priority: EscalationPriority
  assignedRole: Role
  assignedToId?: string
  status: EscalationStatus
  createdAt: string
  createdBy: string
  comments: EscalationComment[]
  history: EscalationHistoryEntry[]
}

export interface AuditLogEntry {
  id: string
  actor: string
  action: string
  target: string
  time: string
}

export type NotificationType =
  | 'reminder'
  | 'payment'
  | 'message'
  | 'system'
  | 'broadcast'
  | 'escalation'
  | 'assignment'
  | 'image'
  | 'ai-review'

export interface AppNotification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: NotificationType
  href?: string
}
