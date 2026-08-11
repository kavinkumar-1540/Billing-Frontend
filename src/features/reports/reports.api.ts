import { apiClient } from '@/lib/api-client'
import type {
  DateRangeParams,
  GstReport,
  InventoryReportRow,
  OutstandingReportRow,
  PaymentReportRow,
  PurchaseReportRow,
  SalesReportRow,
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
