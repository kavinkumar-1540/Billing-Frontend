import { apiClient } from '@/lib/api-client'
import type {
  DateRangeParams,
  GstReport,
  GstTransactionRow,
  InventoryReportRow,
  LedgerEntryRow,
  MonthlyReportRow,
  OutstandingReportRow,
  PartyLedgerBalanceRow,
  PaymentReportRow,
  PurchaseReportRow,
  SalesReportRow,
  StockMovementReportRow,
} from './reports.types'

export async function fetchSalesReport(params: DateRangeParams): Promise<SalesReportRow[]> {
  const { data } = await apiClient.get<SalesReportRow[]>('/reports/sales', { params })
  return data
}

export async function fetchPurchaseReport(params: DateRangeParams): Promise<PurchaseReportRow[]> {
  const { data } = await apiClient.get<PurchaseReportRow[]>('/reports/purchases', { params })
  return data
}

export async function fetchGstReport(params: DateRangeParams): Promise<GstReport> {
  const { data } = await apiClient.get<GstReport>('/reports/gst', { params })
  return data
}

export async function fetchInventoryReport(): Promise<InventoryReportRow[]> {
  const { data } = await apiClient.get<InventoryReportRow[]>('/reports/inventory')
  return data
}

export async function fetchOutstandingReport(): Promise<OutstandingReportRow[]> {
  const { data } = await apiClient.get<OutstandingReportRow[]>('/reports/outstanding')
  return data
}

export async function fetchPaymentReport(params: DateRangeParams): Promise<PaymentReportRow[]> {
  const { data } = await apiClient.get<PaymentReportRow[]>('/reports/payments', { params })
  return data
}

export async function fetchCreditorsReport(): Promise<PartyLedgerBalanceRow[]> {
  const { data } = await apiClient.get<PartyLedgerBalanceRow[]>('/reports/creditors')
  return data
}

export async function fetchDebtorsReport(): Promise<PartyLedgerBalanceRow[]> {
  const { data } = await apiClient.get<PartyLedgerBalanceRow[]>('/reports/debtors')
  return data
}

export async function fetchMonthlyReport(): Promise<MonthlyReportRow[]> {
  const { data } = await apiClient.get<MonthlyReportRow[]>('/reports/monthly')
  return data
}

export async function fetchGstRegisterReport(params: DateRangeParams): Promise<GstTransactionRow[]> {
  const { data } = await apiClient.get<GstTransactionRow[]>('/reports/gst-register', { params })
  return data
}

export async function fetchStockMovementReport(): Promise<StockMovementReportRow[]> {
  const { data } = await apiClient.get<StockMovementReportRow[]>('/reports/stock-movement')
  return data
}

export async function fetchLedgerReport(partyId: string): Promise<LedgerEntryRow[]> {
  const { data } = await apiClient.get<LedgerEntryRow[]>('/reports/ledger', { params: { partyId } })
  return data
}
