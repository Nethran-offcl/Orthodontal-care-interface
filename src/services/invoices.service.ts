import { supabase } from '@/lib/supabase'
import type { Invoice, InvoiceStatus } from '@/types'
import { sanitizeSearchTerm } from './supabase-helpers'

interface InvoiceRow {
  id: string
  patient_id: string
  date: string
  items: Invoice['items']
  total: number
  paid: number
  status: InvoiceStatus
}

function fromRow(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    patientId: row.patient_id,
    date: row.date,
    items: row.items,
    total: row.total,
    paid: row.paid,
    status: row.status,
  }
}

function toRow(invoice: Partial<Invoice>): Partial<InvoiceRow> {
  const row: Partial<InvoiceRow> = {}
  if (invoice.patientId !== undefined) row.patient_id = invoice.patientId
  if (invoice.date !== undefined) row.date = invoice.date
  if (invoice.items !== undefined) row.items = invoice.items
  if (invoice.total !== undefined) row.total = invoice.total
  if (invoice.paid !== undefined) row.paid = invoice.paid
  if (invoice.status !== undefined) row.status = invoice.status
  return row
}

export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase.from('invoices').select('*').order('date', { ascending: false })
    if (error) throw error
    return (data as InvoiceRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Invoice | undefined> {
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as InvoiceRow) : undefined
  },

  async create(input: Omit<Invoice, 'id'>): Promise<Invoice> {
    const { data, error } = await supabase.from('invoices').insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as InvoiceRow)
  },

  async update(id: string, patch: Partial<Invoice>): Promise<Invoice> {
    const { data, error } = await supabase.from('invoices').update(toRow(patch)).eq('id', id).select().single()
    if (error) throw error
    return fromRow(data as InvoiceRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Invoice[]> {
    const term = sanitizeSearchTerm(query)
    if (!term) return invoicesService.getAll()
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .or(`id.ilike.%${term}%,status.ilike.%${term}%,patient_id.ilike.%${term}%`)
    if (error) throw error
    return (data as InvoiceRow[]).map(fromRow)
  },

  async recordPayment(invoiceId: string, amount: number): Promise<Invoice> {
    const invoice = await invoicesService.getById(invoiceId)
    if (!invoice) throw new Error(`Invoice not found: ${invoiceId}`)
    const paid = Math.min(invoice.total, invoice.paid + amount)
    const status: InvoiceStatus = paid >= invoice.total ? 'paid' : 'partial'
    return invoicesService.update(invoiceId, { paid, status })
  },

  async getOutstanding(): Promise<Invoice[]> {
    const { data, error } = await supabase.from('invoices').select('*').neq('status', 'paid').order('date', { ascending: false })
    if (error) throw error
    return (data as InvoiceRow[]).map(fromRow)
  },

  async getTotalOutstanding(): Promise<number> {
    const outstanding = await invoicesService.getOutstanding()
    return outstanding.reduce((sum, i) => sum + (i.total - i.paid), 0)
  },
}
