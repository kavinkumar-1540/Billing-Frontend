export type SalesOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PARTIALLY_INVOICED'
  | 'INVOICED'
  | 'CANCELLED'
  | 'COMPLETED'

export interface SalesOrder {
  _id: string
  orderNumber: string
  orderDate: string
  customerId: string
  customerSnapshot: { name: string }
  taxSummary: { grandTotal: number }
  status: SalesOrderStatus
}

export interface CreateSalesOrderPayload {
  customerId: string
  orderDate: string
  items: {
    itemId: string
    quantity: number
    rate: number
    discountPercent?: number
  }[]
}