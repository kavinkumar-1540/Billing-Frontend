import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { CreateSalesInvoicePayload, SalesInvoice } from './sales-invoices.types'

export async function fetchSalesInvoices(
  params: PaginationParams,
): Promise<PaginatedResult<SalesInvoice>> {
  const response = await apiClient.get<PaginatedResult<SalesInvoice>>('/sales-invoices', { params })
  return response.data
}

export async function fetchSalesInvoice(id: string): Promise<SalesInvoice> {
  const response = await apiClient.get<SalesInvoice>(`/sales-invoices/${id}`)
  return response.data
}

export async function issueSalesInvoice(payload: CreateSalesInvoicePayload): Promise<SalesInvoice> {
  const response = await apiClient.post<SalesInvoice>('/sales-invoices', payload)
  return response.data
}

export async function cancelSalesInvoice(id: string, reason: string): Promise<SalesInvoice> {
  const response = await apiClient.patch<SalesInvoice>(`/sales-invoices/${id}/cancel`, { reason })
  return response.data
}