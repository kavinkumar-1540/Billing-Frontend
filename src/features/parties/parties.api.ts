import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { Party, PartyFormValues, PartyType } from './parties.types'

export async function fetchParties(
  partyType: PartyType,
  params: PaginationParams,
): Promise<PaginatedResult<Party>> {
  const response = await apiClient.get<PaginatedResult<Party>>('/parties', {
    params: { ...params, partyType },
  })
  return response.data
}

export async function fetchParty(id: string): Promise<Party> {
  const response = await apiClient.get<Party>(`/parties/${id}`)
  return response.data
}

export async function createParty(payload: PartyFormValues): Promise<Party> {
  const response = await apiClient.post<Party>('/parties', payload)
  return response.data
}

export async function updateParty(id: string, payload: Partial<PartyFormValues>): Promise<Party> {
  const response = await apiClient.patch<Party>(`/parties/${id}`, payload)
  return response.data
}

export async function deactivateParty(id: string): Promise<Party> {
  const response = await apiClient.delete<Party>(`/parties/${id}`)
  return response.data
}