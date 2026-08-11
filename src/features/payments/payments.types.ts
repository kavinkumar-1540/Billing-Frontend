export type PaymentType = 'RECEIPT' | 'PAYMENT'
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'CREDIT'
export type AllocationRefType = 'SALES_INVOICE' | 'PURCHASE_BILL'

export interface Payment {
  _id: string
  paymentNumber: string
  paymentType: PaymentType
  date: string
  partyId: string
  amount: number
  method: PaymentMethod
  referenceNumber?: string
  bank?: string
  notes?: string
}

export interface PaymentAllocationInput {
  refDocType: AllocationRefType
  refDocId: string
  amount: number
}

export interface CreatePaymentPayload {
  paymentType: PaymentType
  partyId: string
  date: string
  amount: number
  method: PaymentMethod
  referenceNumber?: string
  bank?: string
  notes?: string
  allocations: PaymentAllocationInput[]
}
