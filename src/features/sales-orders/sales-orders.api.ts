import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { SalesOrder } from './sales-orders.types'

export async function fetchSalesOrders(
  params: PaginationParams,
): Promise<PaginatedResult<SalesOrder>> {
  const response = await apiClient.get<PaginatedResult<SalesOrder>>('/sales-orders', { params })
  return response.data
}