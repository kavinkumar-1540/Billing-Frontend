import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { CreatePurchaseOrderPayload, PurchaseOrder } from './purchase-orders.types'

export async function fetchPurchaseOrders(
  params: PaginationParams,
): Promise<PaginatedResult<PurchaseOrder>> {
  const response = await apiClient.get<PaginatedResult<PurchaseOrder>>('/purchase-orders', { params })
  return response.data
}

export async function createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
  const response = await apiClient.post<PurchaseOrder>('/purchase-orders', payload)
  return response.data
}
