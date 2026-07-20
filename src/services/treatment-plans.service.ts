import { supabase } from '@/lib/supabase'
import type { TreatmentPlan, TreatmentStage, TreatmentStageStatus } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'
import { nextId } from './types'

interface TreatmentPlanRow {
  id: string
  patient_id: string
  title: string
  created_on: string
  created_by_doctor_id: string
  stages: TreatmentStage[]
  status: TreatmentPlan['status']
}

function fromRow(row: TreatmentPlanRow): TreatmentPlan {
  return {
    id: row.id,
    patientId: row.patient_id,
    title: row.title,
    createdOn: row.created_on,
    createdByDoctorId: row.created_by_doctor_id,
    stages: row.stages,
    status: row.status,
  }
}

function toRow(plan: Partial<TreatmentPlan>): Partial<TreatmentPlanRow> {
  const row: Partial<TreatmentPlanRow> = {}
  if (plan.patientId !== undefined) row.patient_id = plan.patientId
  if (plan.title !== undefined) row.title = plan.title
  if (plan.createdOn !== undefined) row.created_on = plan.createdOn
  if (plan.createdByDoctorId !== undefined) row.created_by_doctor_id = plan.createdByDoctorId
  if (plan.stages !== undefined) row.stages = plan.stages
  if (plan.status !== undefined) row.status = plan.status
  return row
}

export const treatmentPlansService = {
  async getAll(): Promise<TreatmentPlan[]> {
    const { data, error } = await supabase.from('treatment_plans').select('*').order('created_on', { ascending: false })
    if (error) throw error
    return (data as TreatmentPlanRow[]).map(fromRow)
  },

  async getById(id: string): Promise<TreatmentPlan | undefined> {
    const { data, error } = await supabase.from('treatment_plans').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as TreatmentPlanRow) : undefined
  },

  async create(input: Omit<TreatmentPlan, 'id'>): Promise<TreatmentPlan> {
    const { data, error } = await supabase.from('treatment_plans').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as TreatmentPlanRow)
  },

  async update(id: string, patch: Partial<TreatmentPlan>): Promise<TreatmentPlan> {
    const { data, error } = await supabase.from('treatment_plans').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as TreatmentPlanRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('treatment_plans').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<TreatmentPlan[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return treatmentPlansService.getAll()
    const { data, error } = await supabase
      .from('treatment_plans')
      .select('*')
      .or(`title.ilike.%${term}%,status.ilike.%${term}%,patient_id.ilike.%${term}%`)
    if (error) throw error
    return (data as TreatmentPlanRow[]).map(fromRow)
  },

  async addStage(planId: string, stage: Omit<TreatmentStage, 'id'>): Promise<TreatmentStage> {
    const plan = await treatmentPlansService.getById(planId)
    if (!plan) throw new Error(`Treatment plan not found: ${planId}`)
    const newStage: TreatmentStage = { ...stage, id: nextId('STG') }
    await treatmentPlansService.update(planId, { stages: [...plan.stages, newStage] })
    return newStage
  },

  async updateStageStatus(planId: string, stageId: string, status: TreatmentStageStatus): Promise<TreatmentPlan> {
    const plan = await treatmentPlansService.getById(planId)
    if (!plan) throw new Error(`Treatment plan not found: ${planId}`)
    const stages = plan.stages.map((st) => (st.id === stageId ? { ...st, status } : st))
    const allDone = stages.every((st) => st.status === 'completed')
    return treatmentPlansService.update(planId, { stages, status: allDone ? 'completed' : 'active' })
  },
}
