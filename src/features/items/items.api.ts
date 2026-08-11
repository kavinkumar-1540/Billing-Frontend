import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { Category, Item, ItemFormValues, TaxRate } from './items.types'

export async function fetchItems(params: PaginationParams): Promise<PaginatedResult<Item>> {
  const response = await apiClient.get<PaginatedResult<Item>>('/items', { params })
  return response.data
}

export async function createItem(payload: ItemFormValues): Promise<Item> {
  const response = await apiClient.post<Item>('/items', payload)
  return response.data
}

export async function updateItem(id: string, payload: Partial<ItemFormValues>): Promise<Item> {
  const response = await apiClient.patch<Item>(`/items/${id}`, payload)
  return response.data
}

export async function deactivateItem(id: string): Promise<Item> {
  const response = await apiClient.delete<Item>(`/items/${id}`)
  return response.data
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories')
  return response.data
}

export async function createCategory(name: string): Promise<Category> {
  const response = await apiClient.post<Category>('/categories', { name })
  return response.data
}

export async function fetchTaxRates(): Promise<TaxRate[]> {
  const response = await apiClient.get<TaxRate[]>('/tax-rates')
  return response.data
}

export async function createTaxRate(payload: {
  name: string
  ratePercent: number
  cessPercent?: number
}): Promise<TaxRate> {
  const response = await apiClient.post<TaxRate>('/tax-rates', payload)
  return response.data
}