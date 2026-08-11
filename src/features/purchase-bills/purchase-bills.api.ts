import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { CreatePurchaseBillPayload, PurchaseBill } from './purchase-bills.types'

export async function fetchPurchaseBills(
  params: PaginationParams,
): Promise<PaginatedResult<PurchaseBill>> {
  const response = await apiClient.get<PaginatedResult<PurchaseBill>>('/purchase-bills', { params })
  return response.data
}

export async function fetchPurchaseBill(id: string): Promise<PurchaseBill> {
  const response = await apiClient.get<PurchaseBill>(`/purchase-bills/${id}`)
  return response.data
}

export async function confirmPurchaseBill(
  payload: CreatePurchaseBillPayload,
): Promise<PurchaseBill> {
  const response = await apiClient.post<PurchaseBill>('/purchase-bills', payload)
  return response.data
}

export async function cancelPurchaseBill(id: string, reason: string): Promise<PurchaseBill> {
  const response = await apiClient.patch<PurchaseBill>(`/purchase-bills/${id}/cancel`, { reason })
  return response.data
}
