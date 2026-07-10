import * as React from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type {
  Appointment,
  AppointmentStatus,
  AppNotification,
  Broadcast,
  BroadcastStatus,
  ChartEntry,
  Conversation,
  Invoice,
  MessageTemplate,
  Patient,
  PatientImage,
  Prescription,
  Reminder,
  ReminderStatus,
  TreatmentPlan,
  TreatmentStage,
  TreatmentStageStatus,
} from '@/data/types'
import {
  appointments as seedAppointments,
  auditLog as seedAuditLog,
  broadcasts as seedBroadcasts,
  chartEntries as seedChartEntries,
  conversations as seedConversations,
  patientImages as seedImages,
  invoices as seedInvoices,
  messageTemplates as seedTemplates,
  notifications as seedNotifications,
  patients as seedPatients,
  prescriptions as seedPrescriptions,
  reminders as seedReminders,
  treatmentPlans as seedTreatmentPlans,
} from '@/data'
import type { AuditLogEntry } from '@/data/types'

interface Store {
  patients: Patient[]
  appointments: Appointment[]
  treatmentPlans: TreatmentPlan[]
  chartEntries: ChartEntry[]
  prescriptions: Prescription[]
  images: PatientImage[]
  invoices: Invoice[]
  conversations: Conversation[]
  reminders: Reminder[]
  broadcasts: Broadcast[]
  templates: MessageTemplate[]
  notifications: AppNotification[]
  auditLog: AuditLogEntry[]
}

const initialStore: Store = {
  patients: seedPatients,
  appointments: seedAppointments,
  treatmentPlans: seedTreatmentPlans,
  chartEntries: seedChartEntries,
  prescriptions: seedPrescriptions,
  images: seedImages,
  invoices: seedInvoices,
  conversations: seedConversations,
  reminders: seedReminders,
  broadcasts: seedBroadcasts,
  templates: seedTemplates,
  notifications: seedNotifications,
  auditLog: seedAuditLog,
}

let idCounter = 9000
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

interface ClinicStoreValue extends Store {
  addAuditEntry: (actor: string, action: string, target: string) => void
  addPatient: (patient: Omit<Patient, 'id'>) => Patient
  updatePatient: (id: string, patch: Partial<Patient>) => void
  addAppointment: (appt: Omit<Appointment, 'id'>) => Appointment
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  rescheduleAppointment: (id: string, date: string, startTime: string) => void
  recordPayment: (invoiceId: string, amount: number) => void
  addChartEntry: (entry: Omit<ChartEntry, 'id'>) => ChartEntry
  addPrescription: (rx: Omit<Prescription, 'id'>) => Prescription
  addTreatmentPlan: (plan: Omit<TreatmentPlan, 'id'>) => TreatmentPlan
  addTreatmentStage: (planId: string, stage: Omit<TreatmentStage, 'id'>) => void
  updateStageStatus: (planId: string, stageId: string, status: TreatmentStageStatus) => void
  addImage: (image: Omit<PatientImage, 'id'>) => PatientImage
  sendMessage: (patientId: string, text: string) => void
  markConversationRead: (patientId: string) => void
  simulatePatientReply: (patientId: string, text: string) => void
  updateReminderStatus: (id: string, status: ReminderStatus) => void
  createBroadcast: (bc: Omit<Broadcast, 'id' | 'status' | 'createdAt'>) => Broadcast
  submitBroadcastForApproval: (id: string) => void
  approveBroadcast: (id: string) => void
  rejectBroadcast: (id: string, note: string) => void
  sendBroadcastNow: (id: string) => void
  addTemplate: (t: Omit<MessageTemplate, 'id' | 'usedCount' | 'approvalStatus'>) => MessageTemplate
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  pushNotification: (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => void
}

const ClinicStoreContext = createContext<ClinicStoreValue | null>(null)

export function ClinicStoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(initialStore)

  const addAuditEntry = useCallback((actor: string, action: string, target: string) => {
    setStore((s) => ({
      ...s,
      auditLog: [
        { id: nextId('AL'), actor, action, target, time: new Date().toISOString() },
        ...s.auditLog,
      ],
    }))
  }, [])

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    setStore((s) => ({
      ...s,
      notifications: [
        { ...n, id: nextId('N'), time: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }))
  }, [])

  const addPatient = useCallback((patient: Omit<Patient, 'id'>) => {
    const newPatient: Patient = { ...patient, id: nextId('PT') }
    setStore((s) => ({ ...s, patients: [newPatient, ...s.patients] }))
    addAuditEntry('Priya Kulkarni', 'Added new patient', `${newPatient.name} — ${newPatient.id}`)
    return newPatient
  }, [addAuditEntry])

  const updatePatient = useCallback((id: string, patch: Partial<Patient>) => {
    setStore((s) => ({
      ...s,
      patients: s.patients.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
    addAuditEntry('Priya Kulkarni', 'Updated patient details', id)
  }, [addAuditEntry])

  const addAppointment = useCallback((appt: Omit<Appointment, 'id'>) => {
    const newAppt: Appointment = { ...appt, id: nextId('APT') }
    setStore((s) => ({ ...s, appointments: [...s.appointments, newAppt] }))
    return newAppt
  }, [])

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setStore((s) => ({
      ...s,
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
    }))
  }, [])

  const rescheduleAppointment = useCallback((id: string, date: string, startTime: string) => {
    setStore((s) => ({
      ...s,
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, date, startTime, status: 'confirmed' as AppointmentStatus } : a,
      ),
    }))
  }, [])

  const recordPayment = useCallback((invoiceId: string, amount: number) => {
    setStore((s) => ({
      ...s,
      invoices: s.invoices.map((inv) => {
        if (inv.id !== invoiceId) return inv
        const paid = Math.min(inv.total, inv.paid + amount)
        return { ...inv, paid, status: paid >= inv.total ? 'paid' : 'partial' }
      }),
    }))
    addAuditEntry('Priya Kulkarni', 'Recorded payment', `${invoiceId} — ₹${amount.toLocaleString('en-IN')} received`)
  }, [addAuditEntry])

  const addChartEntry = useCallback((entry: Omit<ChartEntry, 'id'>) => {
    const newEntry: ChartEntry = { ...entry, id: nextId('CE') }
    setStore((s) => ({ ...s, chartEntries: [newEntry, ...s.chartEntries] }))
    return newEntry
  }, [])

  const addPrescription = useCallback((rx: Omit<Prescription, 'id'>) => {
    const newRx: Prescription = { ...rx, id: nextId('RX') }
    setStore((s) => ({ ...s, prescriptions: [newRx, ...s.prescriptions] }))
    return newRx
  }, [])

  const addTreatmentPlan = useCallback((plan: Omit<TreatmentPlan, 'id'>) => {
    const newPlan: TreatmentPlan = { ...plan, id: nextId('TP') }
    setStore((s) => ({ ...s, treatmentPlans: [...s.treatmentPlans, newPlan] }))
    return newPlan
  }, [])

  const addTreatmentStage = useCallback((planId: string, stage: Omit<TreatmentStage, 'id'>) => {
    const newStage: TreatmentStage = { ...stage, id: nextId('STG') }
    setStore((s) => ({
      ...s,
      treatmentPlans: s.treatmentPlans.map((p) =>
        p.id === planId ? { ...p, stages: [...p.stages, newStage] } : p,
      ),
    }))
  }, [])

  const updateStageStatus = useCallback(
    (planId: string, stageId: string, status: TreatmentStageStatus) => {
      setStore((s) => ({
        ...s,
        treatmentPlans: s.treatmentPlans.map((p) => {
          if (p.id !== planId) return p
          const stages = p.stages.map((st) => (st.id === stageId ? { ...st, status } : st))
          const allDone = stages.every((st) => st.status === 'completed')
          return { ...p, stages, status: allDone ? 'completed' : 'active' }
        }),
      }))
    },
    [],
  )

  const addImage = useCallback((image: Omit<PatientImage, 'id'>) => {
    const newImage: PatientImage = { ...image, id: nextId('IMG') }
    setStore((s) => ({ ...s, images: [...s.images, newImage] }))
    return newImage
  }, [])

  const sendMessage = useCallback((patientId: string, text: string) => {
    setStore((s) => {
      const existing = s.conversations.find((c) => c.patientId === patientId)
      const message = {
        id: nextId('m'),
        sender: 'clinic' as const,
        text,
        time: new Date().toISOString(),
        status: 'sent' as const,
      }
      if (existing) {
        return {
          ...s,
          conversations: s.conversations.map((c) =>
            c.patientId === patientId
              ? { ...c, messages: [...c.messages, message], lastMessageAt: message.time }
              : c,
          ),
        }
      }
      const newConversation: Conversation = {
        id: nextId('CV'),
        patientId,
        messages: [message],
        lastMessageAt: message.time,
        unread: 0,
        slaMinutes: 0,
      }
      return { ...s, conversations: [...s.conversations, newConversation] }
    })
  }, [])

  const markConversationRead = useCallback((patientId: string) => {
    setStore((s) => ({
      ...s,
      conversations: s.conversations.map((c) => (c.patientId === patientId ? { ...c, unread: 0 } : c)),
    }))
  }, [])

  const simulatePatientReply = useCallback((patientId: string, text: string) => {
    setStore((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.patientId === patientId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: nextId('m'), sender: 'patient' as const, text, time: new Date().toISOString() },
              ],
              lastMessageAt: new Date().toISOString(),
              unread: c.unread + 1,
            }
          : c,
      ),
    }))
  }, [])

  const updateReminderStatus = useCallback((id: string, status: ReminderStatus) => {
    setStore((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, status } : r)),
    }))
  }, [])

  const createBroadcast = useCallback((bc: Omit<Broadcast, 'id' | 'status' | 'createdAt'>) => {
    const newBc: Broadcast = {
      ...bc,
      id: nextId('BC'),
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    setStore((s) => ({ ...s, broadcasts: [newBc, ...s.broadcasts] }))
    return newBc
  }, [])

  const setBroadcastStatus = useCallback(
    (id: string, status: BroadcastStatus, extra?: Partial<Broadcast>) => {
      setStore((s) => ({
        ...s,
        broadcasts: s.broadcasts.map((b) => (b.id === id ? { ...b, status, ...extra } : b)),
      }))
    },
    [],
  )

  const submitBroadcastForApproval = useCallback(
    (id: string) => {
      setBroadcastStatus(id, 'pending-approval')
      setStore((s) => {
        const bc = s.broadcasts.find((b) => b.id === id)
        return bc
          ? {
              ...s,
              notifications: [
                {
                  id: nextId('N'),
                  title: 'Broadcast awaiting your approval',
                  description: `"${bc.title}" needs review before it can send to ${bc.audienceCount} patients.`,
                  time: new Date().toISOString(),
                  read: false,
                  type: 'broadcast',
                  href: '/messaging/broadcasts',
                },
                ...s.notifications,
              ],
            }
          : s
      })
    },
    [setBroadcastStatus],
  )

  const approveBroadcast = useCallback(
    (id: string) => {
      setBroadcastStatus(id, 'approved')
      addAuditEntry('Dr. Arjun Rao', 'Approved broadcast', id)
    },
    [setBroadcastStatus, addAuditEntry],
  )

  const rejectBroadcast = useCallback(
    (id: string, note: string) => {
      setBroadcastStatus(id, 'rejected', { reviewNote: note })
      addAuditEntry('Dr. Arjun Rao', 'Rejected broadcast', id)
    },
    [setBroadcastStatus, addAuditEntry],
  )

  const sendBroadcastNow = useCallback(
    (id: string) => {
      setStore((s) => {
        const bc = s.broadcasts.find((b) => b.id === id)
        const delivered = bc ? Math.round(bc.audienceCount * 0.97) : 0
        return {
          ...s,
          broadcasts: s.broadcasts.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: 'sent',
                  sentAt: new Date().toISOString(),
                  deliveredCount: delivered,
                  readCount: Math.round(delivered * 0.6),
                }
              : b,
          ),
        }
      })
      addAuditEntry('Priya Kulkarni', 'Sent broadcast', id)
    },
    [addAuditEntry],
  )

  const addTemplate = useCallback((t: Omit<MessageTemplate, 'id' | 'usedCount' | 'approvalStatus'>) => {
    const newTemplate: MessageTemplate = { ...t, id: nextId('TPL'), usedCount: 0, approvalStatus: 'pending' }
    setStore((s) => ({ ...s, templates: [...s.templates, newTemplate] }))
    return newTemplate
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setStore((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setStore((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }))
  }, [])

  const value = useMemo<ClinicStoreValue>(
    () => ({
      ...store,
      addAuditEntry,
      addPatient,
      updatePatient,
      addAppointment,
      updateAppointmentStatus,
      rescheduleAppointment,
      recordPayment,
      addChartEntry,
      addPrescription,
      addTreatmentPlan,
      addTreatmentStage,
      updateStageStatus,
      addImage,
      sendMessage,
      markConversationRead,
      simulatePatientReply,
      updateReminderStatus,
      createBroadcast,
      submitBroadcastForApproval,
      approveBroadcast,
      rejectBroadcast,
      sendBroadcastNow,
      addTemplate,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
    }),
    [
      store,
      addAuditEntry,
      addPatient,
      updatePatient,
      addAppointment,
      updateAppointmentStatus,
      rescheduleAppointment,
      recordPayment,
      addChartEntry,
      addPrescription,
      addTreatmentPlan,
      addTreatmentStage,
      updateStageStatus,
      addImage,
      sendMessage,
      markConversationRead,
      simulatePatientReply,
      updateReminderStatus,
      createBroadcast,
      submitBroadcastForApproval,
      approveBroadcast,
      rejectBroadcast,
      sendBroadcastNow,
      addTemplate,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
    ],
  )

  return <ClinicStoreContext.Provider value={value}>{children}</ClinicStoreContext.Provider>
}

export function useClinicStore() {
  const ctx = useContext(ClinicStoreContext)
  if (!ctx) throw new Error('useClinicStore must be used within ClinicStoreProvider')
  return ctx
}
