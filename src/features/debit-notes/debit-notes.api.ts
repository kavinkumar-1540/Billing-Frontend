import { apiClient } from '@/lib/api-client'
import type { PaginatedResult, PaginationParams } from '@/types/api'
import type { CreateDebitNotePayload, DebitNote } from './debit-notes.types'

export async function fetchDebitNotes(
  params: PaginationParams,
): Promise<PaginatedResult<DebitNote>> {
  const response = await apiClient.get<PaginatedResult<DebitNote>>('/debit-notes', { params })
  return response.data
}

export async function issueDebitNote(payload: CreateDebitNotePayload): Promise<DebitNote> {
  const response = await apiClient.post<DebitNote>('/debit-notes', payload)
  return response.data
}
