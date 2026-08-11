import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { CreatePaymentPayload, Payment } from './payments.types'

export async function fetchReceipts(params: PaginationParams): Promise<PaginatedResult<Payment>> {
  const response = await apiClient.get<PaginatedResult<Payment>>('/payments/receipts', { params })
  return response.data
}

export async function fetchSupplierPayments(
  params: PaginationParams,
): Promise<PaginatedResult<Payment>> {
  const response = await apiClient.get<PaginatedResult<Payment>>('/payments/supplier-payments', {
    params,
  })
  return response.data
}

export async function recordPayment(payload: CreatePaymentPayload): Promise<Payment> {
  const response = await apiClient.post<Payment>('/payments', payload)
  return response.data
}
