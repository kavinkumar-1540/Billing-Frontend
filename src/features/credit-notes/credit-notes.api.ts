import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { CreateCreditNotePayload, CreditNote } from './credit-notes.types'

export async function fetchCreditNotes(
  params: PaginationParams,
): Promise<PaginatedResult<CreditNote>> {
  const response = await apiClient.get<PaginatedResult<CreditNote>>('/credit-notes', { params })
  return response.data
}

export async function issueCreditNote(payload: CreateCreditNotePayload): Promise<CreditNote> {
  const response = await apiClient.post<CreditNote>('/credit-notes', payload)
  return response.data
}
