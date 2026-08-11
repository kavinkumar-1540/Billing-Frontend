export interface DebitNote {
  _id: string
  noteNumber: string
  date: string
  originalBillId: string
  supplierId: string
  supplierSnapshot: { name: string }
  reason: string
  taxSummary: { grandTotal: number }
  status: 'DRAFT' | 'ISSUED' | 'CANCELLED'
}

export interface CreateDebitNotePayload {
  originalBillId: string
  date: string
  reason: string
  items: {
    itemId: string
    quantity: number
    rate: number
    discountPercent?: number
  }[]
}
