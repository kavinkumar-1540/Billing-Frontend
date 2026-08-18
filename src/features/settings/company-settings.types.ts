import type { Address } from '@/types/api'

export interface BankDetails {
  bankName?: string
  branchName?: string
  accountNumber?: string
  ifscCode?: string
  upiId?: string
}

export interface InvoiceBranding {
  invoicePrefix?: string
  defaultPaymentTermDays?: number
  termsAndConditions?: string
}

export interface CompanyProfile {
  _id: string
  slug: string
  name: string
  legalName?: string
  tradeName?: string
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
  bankDetails?: BankDetails
  invoiceBranding?: InvoiceBranding
  isActive: boolean
}

export interface UpdateCompanyPayload {
  name?: string
  legalName?: string
  tradeName?: string
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
  bankDetails?: BankDetails
  invoiceBranding?: InvoiceBranding
}
