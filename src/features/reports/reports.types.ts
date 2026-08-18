export interface SalesReportRow {
  date: string
  invoiceCount: number
  taxableAmount: number
  totalTax: number
  grandTotal: number
}

export interface PurchaseReportRow {
  date: string
  billCount: number
  taxableAmount: number
  totalTax: number
  grandTotal: number
}

export interface GstReportRow {
  gstRatePercent: number
  taxableAmount: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  total: number
}

export interface GstReport {
  sales: GstReportRow[]
  purchases: GstReportRow[]
}

export interface InventoryReportRow {
  itemId: string
  name: string
  sku: string
  unit: string
  currentStock: number
  minStock: number
  purchasePrice: number
  sellingPrice: number
  stockValue: number
  isLowStock: boolean
}

export interface OutstandingReportRow {
  partyId: string
  name: string
  partyType: string
  gstin?: string
  currentOutstanding: number
}

export interface PaymentReportRow {
  date: string
  paymentType: 'RECEIPT' | 'PAYMENT'
  method: string
  count: number
  totalAmount: number
}

export type AgingBucket = 'CURRENT' | '1-30' | '31-60' | '60+'
export type PartyLedgerStatus = 'CURRENT' | 'OVERDUE' | 'SETTLED'

export interface PartyLedgerBalanceRow {
  partyId: string
  name: string
  gstin?: string
  phone?: string
  currentOutstanding: number
  totalBilled: number
  totalSettled: number
  creditLimit?: number
  aging: AgingBucket
  status: PartyLedgerStatus
}

export type GstTransactionType = 'SALES_INVOICE' | 'PURCHASE_BILL' | 'CREDIT_NOTE'

export interface GstTransactionRow {
  date: string
  docNumber: string
  type: GstTransactionType
  partyName: string
  partyGstin?: string
  placeOfSupply?: string
  taxableAmount: number
  cgst: number
  sgst: number
  igst: number
  total: number
}

export interface StockMovementReportRow {
  itemId: string
  name: string
  sku: string
  unit: string
  hsnSac?: string
  category?: string
  openingStock: number
  inward: number
  outward: number
  closingStock: number
  purchasePrice: number
  stockValue: number
  isLowStock: boolean
  movementIsFullHistory: boolean
}

export type LedgerEntryType =
  | 'SALES_INVOICE'
  | 'PURCHASE_BILL'
  | 'RECEIPT'
  | 'PAYMENT'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE'

export interface LedgerEntryRow {
  date: string
  voucherNumber: string
  type: LedgerEntryType
  particulars: string
  debit: number
  credit: number
  balance: number
}

export interface MonthlyReportRow {
  monthKey: string
  monthName: string
  invoicesCount: number
  taxableSales: number
  salesGst: number
  salesTotal: number
  purchaseTotal: number
  purchaseGst: number
  receiptsTotal: number
  paymentsTotal: number
  netCashFlow: number
}

export interface DateRangeParams {
  from?: string
  to?: string
}
