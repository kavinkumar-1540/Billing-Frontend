import type { Address } from '@/types/api'

export type PartyType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH'

export interface Party {
  _id: string
  companyId: string
  partyType: PartyType
  name: string
  businessName?: string
  contactPerson?: string
  phone?: string
  email?: string
  billingAddress?: Address
  shippingAddress?: Address
  gstin?: string
  pan?: string
  state?: string
  stateCode?: string
  placeOfSupply?: string
  creditLimit: number
  paymentTermsDays: number
  openingBalance: number
  currentOutstanding: number
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PartyFormValues {
  partyType: PartyType
  name: string
  businessName?: string
  contactPerson?: string
  phone?: string
  email?: string
  gstin?: string
  pan?: string
  state?: string
  stateCode?: string
  placeOfSupply?: string
  creditLimit?: number
  paymentTermsDays?: number
  openingBalance?: number
  notes?: string
}