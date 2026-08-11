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