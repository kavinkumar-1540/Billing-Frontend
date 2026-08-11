import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { Item } from '@/features/items/items.types'
import type { StockAdjustmentFormValues, StockMovement } from './inventory.types'

export async function fetchStockLevels(params: PaginationParams): Promise<PaginatedResult<Item>> {
  const response = await apiClient.get<PaginatedResult<Item>>('/inventory/stock', { params })
  return response.data
}

export async function fetchStockMovements(
  params: PaginationParams & { itemId?: string },
): Promise<PaginatedResult<StockMovement>> {
  const response = await apiClient.get<PaginatedResult<StockMovement>>('/inventory/movements', {
    params,
  })
  return response.data
}

export async function createStockAdjustment(
  payload: StockAdjustmentFormValues,
): Promise<StockMovement> {
  const response = await apiClient.post<StockMovement>('/inventory/adjustments', payload)
  return response.data
}