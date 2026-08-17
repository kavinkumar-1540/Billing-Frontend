import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { BillAdjustment, CreateBillAdjustmentPayload } from './bill-adjustments.types'

export async function fetchBillAdjustments(
  params: PaginationParams,
): Promise<PaginatedResult<BillAdjustment>> {
  const response = await apiClient.get<PaginatedResult<BillAdjustment>>('/bill-adjustments', { params })
  return response.data
}

export async function createBillAdjustment(payload: CreateBillAdjustmentPayload): Promise<BillAdjustment> {
  const response = await apiClient.post<BillAdjustment>('/bill-adjustments', payload)
  return response.data
}
