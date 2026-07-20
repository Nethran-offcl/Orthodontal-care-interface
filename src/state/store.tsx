import * as React from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type {
  Appointment,
  AppointmentStatus,
  AppNotification,
  Attachment,
  AuditLogEntry,
  Broadcast,
  ChartEntry,
  Conversation,
  ConversationStatus,
  Doctor,
  Escalation,
  EscalationStatus,
  ImageAnnotation,
  Invoice,
  MessageTemplate,
  Patient,
  PatientImage,
  Prescription,
  Reminder,
  ReminderStatus,
  Role,
  StaffMember,
  TreatmentPlan,
  TreatmentStage,
  TreatmentStageStatus,
} from '@/types'
import {
  appointmentsService,
  auditLogService,
  broadcastsService,
  chartEntriesService,
  chatService,
  doctorsService,
  escalationsService,
  imagesService,
  invoicesService,
  notificationsService,
  patientsService,
  prescriptionsService,
  remindersService,
  templatesService,
  treatmentPlansService,
  usersService,
} from '@/services'

interface Store {
  patients: Patient[]
  doctors: Doctor[]
  staff: StaffMember[]
  appointments: Appointment[]
  treatmentPlans: TreatmentPlan[]
  chartEntries: ChartEntry[]
  prescriptions: Prescription[]
  images: PatientImage[]
  invoices: Invoice[]
  conversations: Conversation[]
  escalations: Escalation[]
  reminders: Reminder[]
  broadcasts: Broadcast[]
  templates: MessageTemplate[]
  notifications: AppNotification[]
  auditLog: AuditLogEntry[]
}

const emptyStore: Store = {
  patients: [],
  doctors: [],
  staff: [],
  appointments: [],
  treatmentPlans: [],
  chartEntries: [],
  prescriptions: [],
  images: [],
  invoices: [],
  conversations: [],
  escalations: [],
  reminders: [],
  broadcasts: [],
  templates: [],
  notifications: [],
  auditLog: [],
}

interface ClinicStoreValue extends Store {
  addAuditEntry: (actor: string, action: string, target: string) => Promise<void>
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<Patient>
  updatePatient: (id: string, patch: Partial<Patient>) => Promise<void>
  addAppointment: (appt: Omit<Appointment, 'id'>) => Promise<Appointment>
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>
  rescheduleAppointment: (id: string, date: string, startTime: string) => Promise<void>
  recordPayment: (invoiceId: string, amount: number) => Promise<void>
  addChartEntry: (entry: Omit<ChartEntry, 'id'>) => Promise<ChartEntry>
  addPrescription: (rx: Omit<Prescription, 'id'>) => Promise<Prescription>
  addTreatmentPlan: (plan: Omit<TreatmentPlan, 'id'>) => Promise<TreatmentPlan>
  addTreatmentStage: (planId: string, stage: Omit<TreatmentStage, 'id'>) => Promise<void>
  updateStageStatus: (planId: string, stageId: string, status: TreatmentStageStatus) => Promise<void>
  addImage: (image: Omit<PatientImage, 'id' | 'storagePath'>, file: File) => Promise<PatientImage>
  sendMessage: (patientId: string, text: string) => Promise<void>
  markConversationRead: (patientId: string) => Promise<void>
  simulatePatientReply: (patientId: string, text: string) => Promise<void>
  assignConversation: (id: string, assigneeId: string) => Promise<void>
  updateConversationStatus: (id: string, status: ConversationStatus) => Promise<void>
  addInternalNote: (id: string, author: string, text: string) => Promise<void>
  addAttachment: (id: string, attachment: Omit<Attachment, 'id' | 'time'>) => Promise<void>
  createEscalation: (
    input: Omit<Escalation, 'id' | 'status' | 'createdAt' | 'comments' | 'history'>,
  ) => Promise<Escalation>
  updateEscalationStatus: (id: string, status: EscalationStatus, actor: string) => Promise<void>
  assignEscalation: (id: string, assignedRole: Role, assignedToId: string, actor: string) => Promise<void>
  addEscalationComment: (id: string, author: string, text: string) => Promise<void>
  addImageAnnotation: (imageId: string, annotation: Omit<ImageAnnotation, 'id'>) => Promise<void>
  updateReminderStatus: (id: string, status: ReminderStatus) => Promise<void>
  createBroadcast: (bc: Omit<Broadcast, 'id' | 'status' | 'createdAt'>) => Promise<Broadcast>
  submitBroadcastForApproval: (id: string) => Promise<void>
  approveBroadcast: (id: string) => Promise<void>
  rejectBroadcast: (id: string, note: string) => Promise<void>
  sendBroadcastNow: (id: string) => Promise<void>
  addTemplate: (t: Omit<MessageTemplate, 'id' | 'usedCount' | 'approvalStatus'>) => Promise<MessageTemplate>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  pushNotification: (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => Promise<void>
}

const ClinicStoreContext = createContext<ClinicStoreValue | null>(null)

export function ClinicStoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(emptyStore)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([
      patientsService.getAll(),
      doctorsService.getAll(),
      usersService.getAll(),
      appointmentsService.getAll(),
      treatmentPlansService.getAll(),
      chartEntriesService.getAll(),
      prescriptionsService.getAll(),
      imagesService.getAll(),
      invoicesService.getAll(),
      chatService.getAll(),
      escalationsService.getAll(),
      remindersService.getAll(),
      broadcastsService.getAll(),
      templatesService.getAll(),
      notificationsService.getAll(),
      auditLogService.getAll(),
    ]).then(
      ([
        patients,
        doctors,
        staff,
        appointments,
        treatmentPlans,
        chartEntries,
        prescriptions,
        images,
        invoices,
        conversations,
        escalations,
        reminders,
        broadcasts,
        templates,
        notifications,
        auditLog,
      ]) => {
        if (!alive) return
        setStore({
          patients,
          doctors,
          staff,
          appointments,
          treatmentPlans,
          chartEntries,
          prescriptions,
          images,
          invoices,
          conversations,
          escalations,
          reminders,
          broadcasts,
          templates,
          notifications,
          auditLog,
        })
        setReady(true)
      },
    )
    return () => {
      alive = false
    }
  }, [])

  const addAuditEntry = useCallback(async (actor: string, action: string, target: string) => {
    const entry = await auditLogService.log(actor, action, target)
    setStore((s) => ({ ...s, auditLog: [entry, ...s.auditLog] }))
  }, [])

  const pushNotification = useCallback(async (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const created = await notificationsService.push(n)
    setStore((s) => ({ ...s, notifications: [created, ...s.notifications] }))
  }, [])

  const addPatient = useCallback(
    async (patient: Omit<Patient, 'id'>) => {
      const newPatient = await patientsService.create(patient)
      setStore((s) => ({ ...s, patients: [newPatient, ...s.patients] }))
      await addAuditEntry('Priya Kulkarni', 'Added new patient', `${newPatient.name} — ${newPatient.id}`)
      return newPatient
    },
    [addAuditEntry],
  )

  const updatePatient = useCallback(
    async (id: string, patch: Partial<Patient>) => {
      const updated = await patientsService.update(id, patch)
      setStore((s) => ({ ...s, patients: s.patients.map((p) => (p.id === id ? updated : p)) }))
      await addAuditEntry('Priya Kulkarni', 'Updated patient details', id)
    },
    [addAuditEntry],
  )

  const addAppointment = useCallback(async (appt: Omit<Appointment, 'id'>) => {
    const newAppt = await appointmentsService.create(appt)
    setStore((s) => ({ ...s, appointments: [...s.appointments, newAppt] }))
    const patient = await patientsService.getById(appt.patientId)
    await pushNotification({
      title: 'Appointment booked',
      description: `${patient?.name ?? 'A patient'} — ${appt.date} at ${appt.startTime}.`,
      type: 'system',
      href: `/appointments?focus=${newAppt.id}`,
    })
    return newAppt
  }, [pushNotification])

  const updateAppointmentStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    const updated = await appointmentsService.updateStatus(id, status)
    setStore((s) => ({ ...s, appointments: s.appointments.map((a) => (a.id === id ? updated : a)) }))
  }, [])

  const rescheduleAppointment = useCallback(async (id: string, date: string, startTime: string) => {
    const updated = await appointmentsService.reschedule(id, date, startTime)
    setStore((s) => ({ ...s, appointments: s.appointments.map((a) => (a.id === id ? updated : a)) }))
  }, [])

  const recordPayment = useCallback(
    async (invoiceId: string, amount: number) => {
      const updated = await invoicesService.recordPayment(invoiceId, amount)
      setStore((s) => ({ ...s, invoices: s.invoices.map((inv) => (inv.id === invoiceId ? updated : inv)) }))
      await addAuditEntry('Priya Kulkarni', 'Recorded payment', `${invoiceId} — ₹${amount.toLocaleString('en-IN')} received`)
    },
    [addAuditEntry],
  )

  const addChartEntry = useCallback(async (entry: Omit<ChartEntry, 'id'>) => {
    const newEntry = await chartEntriesService.create(entry)
    setStore((s) => ({ ...s, chartEntries: [newEntry, ...s.chartEntries] }))
    if (entry.source === 'voice') {
      const patient = await patientsService.getById(entry.patientId)
      await pushNotification({
        title: 'AI review required',
        description: `Voice-to-chart entry for ${patient?.name ?? 'a patient'} needs a quick confirmation.`,
        type: 'ai-review',
        href: '/ai-charting',
      })
    }
    return newEntry
  }, [pushNotification])

  const addPrescription = useCallback(async (rx: Omit<Prescription, 'id'>) => {
    const newRx = await prescriptionsService.create(rx)
    setStore((s) => ({ ...s, prescriptions: [newRx, ...s.prescriptions] }))
    return newRx
  }, [])

  const addTreatmentPlan = useCallback(async (plan: Omit<TreatmentPlan, 'id'>) => {
    const newPlan = await treatmentPlansService.create(plan)
    setStore((s) => ({ ...s, treatmentPlans: [...s.treatmentPlans, newPlan] }))
    return newPlan
  }, [])

  const addTreatmentStage = useCallback(async (planId: string, stage: Omit<TreatmentStage, 'id'>) => {
    await treatmentPlansService.addStage(planId, stage)
    const treatmentPlans = await treatmentPlansService.getAll()
    setStore((s) => ({ ...s, treatmentPlans }))
  }, [])

  const updateStageStatus = useCallback(
    async (planId: string, stageId: string, status: TreatmentStageStatus) => {
      await treatmentPlansService.updateStageStatus(planId, stageId, status)
      const treatmentPlans = await treatmentPlansService.getAll()
      setStore((s) => ({ ...s, treatmentPlans }))
    },
    [],
  )

  const addImage = useCallback(async (image: Omit<PatientImage, 'id' | 'storagePath'>, file: File) => {
    const newImage = await imagesService.create(image, file)
    setStore((s) => ({ ...s, images: [...s.images, newImage] }))
    const patient = await patientsService.getById(image.patientId)
    await pushNotification({
      title: 'Image uploaded',
      description: `A new ${image.category.replace('-', ' ')} photo was added for ${patient?.name ?? 'a patient'}.`,
      type: 'image',
      href: `/patients/${image.patientId}?tab=images`,
    })
    return newImage
  }, [pushNotification])

  const sendMessage = useCallback(async (patientId: string, text: string) => {
    await chatService.sendMessage(patientId, text)
    const conversations = await chatService.getAll()
    setStore((s) => ({ ...s, conversations }))
  }, [])

  const markConversationRead = useCallback(async (patientId: string) => {
    await chatService.markRead(patientId)
    const conversations = await chatService.getAll()
    setStore((s) => ({ ...s, conversations }))
  }, [])

  const simulatePatientReply = useCallback(async (patientId: string, text: string) => {
    await chatService.simulateReply(patientId, text)
    const conversations = await chatService.getAll()
    setStore((s) => ({ ...s, conversations }))
  }, [])

  const assignConversation = useCallback(
    async (id: string, assigneeId: string) => {
      await chatService.assign(id, assigneeId)
      const conversations = await chatService.getAll()
      setStore((s) => ({ ...s, conversations }))
      const doctor = await doctorsService.getById(assigneeId)
      if (doctor) {
        const conv = conversations.find((c) => c.id === id)
        const patient = conv ? await patientsService.getById(conv.patientId) : undefined
        await pushNotification({
          title: 'Doctor assigned',
          description: `${doctor.name} was assigned to ${patient?.name ?? 'a patient'}'s conversation.`,
          type: 'assignment',
          href: '/messaging',
        })
      }
      await addAuditEntry('Priya Kulkarni', 'Assigned conversation', id)
    },
    [addAuditEntry, pushNotification],
  )

  const updateConversationStatus = useCallback(async (id: string, status: ConversationStatus) => {
    await chatService.updateStatus(id, status)
    const conversations = await chatService.getAll()
    setStore((s) => ({ ...s, conversations }))
  }, [])

  const addInternalNote = useCallback(async (id: string, author: string, text: string) => {
    await chatService.addInternalNote(id, author, text)
    const conversations = await chatService.getAll()
    setStore((s) => ({ ...s, conversations }))
  }, [])

  const addAttachment = useCallback(async (id: string, attachment: Omit<Attachment, 'id' | 'time'>) => {
    await chatService.addAttachment(id, attachment)
    const conversations = await chatService.getAll()
    setStore((s) => ({ ...s, conversations }))
  }, [])

  const createEscalation = useCallback(
    async (input: Omit<Escalation, 'id' | 'status' | 'createdAt' | 'comments' | 'history'>) => {
      const newEsc = await escalationsService.create(input)
      setStore((s) => ({ ...s, escalations: [newEsc, ...s.escalations] }))
      const patient = await patientsService.getById(input.patientId)
      await pushNotification({
        title: 'Escalation created',
        description: `${patient?.name ?? 'A patient'} — ${input.reason.slice(0, 80)}${input.reason.length > 80 ? '…' : ''}`,
        type: 'escalation',
        href: '/messaging/escalations',
      })
      await addAuditEntry(input.createdBy, 'Created escalation', newEsc.id)
      return newEsc
    },
    [addAuditEntry, pushNotification],
  )

  const updateEscalationStatus = useCallback(async (id: string, status: EscalationStatus, actor: string) => {
    const updated = await escalationsService.updateStatus(id, status, actor)
    setStore((s) => ({ ...s, escalations: s.escalations.map((e) => (e.id === id ? updated : e)) }))
  }, [])

  const assignEscalation = useCallback(
    async (id: string, assignedRole: Role, assignedToId: string, actor: string) => {
      const updated = await escalationsService.assign(id, assignedRole, assignedToId, actor)
      setStore((s) => ({ ...s, escalations: s.escalations.map((e) => (e.id === id ? updated : e)) }))
      if (assignedRole === 'doctor') {
        const doctor = await doctorsService.getById(assignedToId)
        const patient = await patientsService.getById(updated.patientId)
        await pushNotification({
          title: 'Doctor assigned',
          description: `${doctor?.name ?? 'A doctor'} was assigned to an escalation for ${patient?.name ?? 'a patient'}.`,
          type: 'assignment',
          href: '/messaging/escalations',
        })
      }
    },
    [pushNotification],
  )

  const addEscalationComment = useCallback(async (id: string, author: string, text: string) => {
    const updated = await escalationsService.addComment(id, author, text)
    setStore((s) => ({ ...s, escalations: s.escalations.map((e) => (e.id === id ? updated : e)) }))
  }, [])

  const addImageAnnotation = useCallback(async (imageId: string, annotation: Omit<ImageAnnotation, 'id'>) => {
    await imagesService.addAnnotation(imageId, annotation)
    const images = await imagesService.getAll()
    setStore((s) => ({ ...s, images }))
  }, [])

  const updateReminderStatus = useCallback(async (id: string, status: ReminderStatus) => {
    const updated = await remindersService.updateStatus(id, status)
    setStore((s) => ({ ...s, reminders: s.reminders.map((r) => (r.id === id ? updated : r)) }))
    if (status === 'no-response') {
      const patient = await patientsService.getById(updated.patientId)
      await pushNotification({
        title: 'Reminder failed to get a response',
        description: `${patient?.name ?? 'A patient'} hasn't responded to their follow-up reminder.`,
        type: 'reminder',
        href: '/messaging/reminders',
      })
    }
  }, [pushNotification])

  const createBroadcast = useCallback(async (bc: Omit<Broadcast, 'id' | 'status' | 'createdAt'>) => {
    const newBc = await broadcastsService.create(bc)
    setStore((s) => ({ ...s, broadcasts: [newBc, ...s.broadcasts] }))
    return newBc
  }, [])

  const submitBroadcastForApproval = useCallback(
    async (id: string) => {
      const updated = await broadcastsService.submitForApproval(id)
      setStore((s) => ({ ...s, broadcasts: s.broadcasts.map((b) => (b.id === id ? updated : b)) }))
      await pushNotification({
        title: 'Broadcast awaiting your approval',
        description: `"${updated.title}" needs review before it can send to ${updated.audienceCount} patients.`,
        type: 'broadcast',
        href: '/messaging/broadcasts',
      })
    },
    [pushNotification],
  )

  const approveBroadcast = useCallback(
    async (id: string) => {
      const updated = await broadcastsService.approve(id)
      setStore((s) => ({ ...s, broadcasts: s.broadcasts.map((b) => (b.id === id ? updated : b)) }))
      await addAuditEntry('Dr. Arjun Rao', 'Approved broadcast', id)
    },
    [addAuditEntry],
  )

  const rejectBroadcast = useCallback(
    async (id: string, note: string) => {
      const updated = await broadcastsService.reject(id, note)
      setStore((s) => ({ ...s, broadcasts: s.broadcasts.map((b) => (b.id === id ? updated : b)) }))
      await addAuditEntry('Dr. Arjun Rao', 'Rejected broadcast', id)
    },
    [addAuditEntry],
  )

  const sendBroadcastNow = useCallback(
    async (id: string) => {
      const updated = await broadcastsService.sendNow(id)
      setStore((s) => ({ ...s, broadcasts: s.broadcasts.map((b) => (b.id === id ? updated : b)) }))
      await addAuditEntry('Priya Kulkarni', 'Sent broadcast', id)
    },
    [addAuditEntry],
  )

  const addTemplate = useCallback(async (t: Omit<MessageTemplate, 'id' | 'usedCount' | 'approvalStatus'>) => {
    const newTemplate = await templatesService.create(t)
    setStore((s) => ({ ...s, templates: [...s.templates, newTemplate] }))
    return newTemplate
  }, [])

  const markNotificationRead = useCallback(async (id: string) => {
    const updated = await notificationsService.markRead(id)
    setStore((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? updated : n)) }))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await notificationsService.markAllRead()
    const notifications = await notificationsService.getAll()
    setStore((s) => ({ ...s, notifications }))
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
      assignConversation,
      updateConversationStatus,
      addInternalNote,
      addAttachment,
      createEscalation,
      updateEscalationStatus,
      assignEscalation,
      addEscalationComment,
      addImageAnnotation,
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
      assignConversation,
      updateConversationStatus,
      addInternalNote,
      addAttachment,
      createEscalation,
      updateEscalationStatus,
      assignEscalation,
      addEscalationComment,
      addImageAnnotation,
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

  if (!ready) return null

  return <ClinicStoreContext.Provider value={value}>{children}</ClinicStoreContext.Provider>
}

export function useClinicStore() {
  const ctx = useContext(ClinicStoreContext)
  if (!ctx) throw new Error('useClinicStore must be used within ClinicStoreProvider')
  return ctx
}
