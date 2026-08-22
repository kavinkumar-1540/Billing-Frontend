export interface CompanyListItem {
  _id: string
  slug: string
  name: string
  legalName?: string
  gstin?: string
  pan?: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
}

export interface CreateCompanyPayload {
  name: string
  slug: string
  legalName?: string
  gstin?: string
  pan?: string
  phone?: string
  email?: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

export interface UpdateCompanyPayload {
  name?: string
  phone?: string
  email?: string
  gstin?: string
  pan?: string
}
