export type SalesInvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'

export interface DocumentLineItem {
  itemId?: string
  name: string
  sku?: string
  hsnSac?: string
  unit?: string
  quantity: number
  rate: number
  discountAmount: number
  gstRatePercent: number
  taxableValue: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  total: number
}

export interface TaxSummary {
  subtotal: number
  totalDiscount: number
  taxableAmount: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  roundOff: number
  grandTotal: number
}

export interface PartySnapshot {
  name: string
  businessName?: string
  gstin?: string
  state?: string
  stateCode?: string
  phone?: string
  email?: string
}

export interface SalesInvoice {
  _id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  customerId: string
  customerSnapshot: PartySnapshot
  placeOfSupply: string
  items: DocumentLineItem[]
  taxSummary: TaxSummary
  amountPaid: number
  balanceDue: number
  status: SalesInvoiceStatus
  createdAt: string
}

export interface CreateSalesInvoicePayload {
  customerId: string
  invoiceDate: string
  salesOrderId?: string
  items: {
    itemId: string
    quantity: number
    rate: number
    discountPercent?: number
  }[]
}