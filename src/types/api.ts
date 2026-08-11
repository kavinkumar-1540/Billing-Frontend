export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface Address {
  line1?: string
  line2?: string
  city?: string
  state?: string
  stateCode?: string
  country?: string
  pincode?: string
}