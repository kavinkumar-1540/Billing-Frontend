import { apiClient } from '@/lib/api-client'
import type { PaginatedResult } from '@/types/api'
import type { AuditLogListItem, AuditLogQueryParams } from './audit.types'

export async function fetchAuditLogs(params: AuditLogQueryParams): Promise<PaginatedResult<AuditLogListItem>> {
  const response = await apiClient.get<PaginatedResult<AuditLogListItem>>('/audit-logs', { params })
  return response.data
}
