import type { Address } from '@/types/api'

export interface CompanyProfile {
  _id: string
  slug: string
  name: string
  legalName?: string
  logoUrl?: string
  address?: Address
  phone?: string
  email?: string
  website?: string
  gstin?: string
  pan?: string
  cin?: string
  financialYearStartMonth: number
  currency: string
  taxRegistrationType?: string
  isActive: boolean
}

export interface UpdateCompanyPayload {
  name?: string
  legalName?: string
  logoUrl?: string
  address?: Address
  phone?: string
  email?: string
  website?: string
  gstin?: string
  pan?: string
  cin?: string
  financialYearStartMonth?: number
  currency?: string
  taxRegistrationType?: string
}
