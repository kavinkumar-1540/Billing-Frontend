export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SENT'
  | 'CONFIRMED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'COMPLETED'

export interface PurchaseOrder {
  _id: string
  poNumber: string
  orderDate: string
  supplierId: string
  supplierSnapshot: { name: string }
  taxSummary: { grandTotal: number }
  status: PurchaseOrderStatus
}

export interface CreatePurchaseOrderPayload {
  supplierId: string
  orderDate: string
  items: {
    itemId: string
    quantity: number
    rate: number
    discountPercent?: number
  }[]
}
