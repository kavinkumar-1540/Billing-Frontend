export interface CreditNote {
  _id: string
  noteNumber: string
  date: string
  originalInvoiceId: string
  customerId: string
  customerSnapshot: { name: string }
  reason: string
  taxSummary: { grandTotal: number }
  status: 'DRAFT' | 'ISSUED' | 'CANCELLED'
}

export interface CreateCreditNotePayload {
  originalInvoiceId: string
  date: string
  reason: string
  items: {
    itemId: string
    quantity: number
    rate: number
    discountPercent?: number
  }[]
}
