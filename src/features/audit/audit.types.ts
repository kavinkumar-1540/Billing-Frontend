export interface AuditLogListItem {
  _id: string
  action: string
  entity: string
  entityId: string
  userName?: string
  ipAddress?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface AuditLogQueryParams {
  page?: number
  limit?: number
  entity?: string
  action?: string
  from?: string
  to?: string
}
