export type PurchaseBillStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED'

export interface DocumentLineItem {
  itemId?: string
  name: string
  sku?: string
  hsnSac?: string
  unit?: string
  quantity: number
  rate: number
  gstRatePercent: number
  taxableValue: number
  cgst: number
  sgst: number
  igst: number
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

export interface PurchaseBill {
  _id: string
  billNumber: string
  supplierInvoiceNumber?: string
  billDate: string
  supplierId: string
  supplierSnapshot: { name: string; gstin?: string; state?: string; stateCode?: string }
  placeOfSupply: string
  items: DocumentLineItem[]
  taxSummary: TaxSummary
  amountPaid: number
  balanceDue: number
  status: PurchaseBillStatus
}

export interface CreatePurchaseBillPayload {
  supplierId: string
  billDate: string
  supplierInvoiceNumber?: string
  purchaseOrderId?: string
  items: {
    itemId: string
    quantity: number
    rate: number
    discountPercent?: number
  }[]
}
