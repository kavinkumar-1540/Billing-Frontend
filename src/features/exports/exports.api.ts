import { apiClient } from '@/lib/api-client'

export type ExportReportType =
  | 'sales'
  | 'purchases'
  | 'gst'
  | 'inventory'
  | 'outstanding'
  | 'payments'
  | 'audit'
  | 'creditors'
  | 'debtors'

export interface ExportDateRangeParams {
  from?: string
  to?: string
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function exportReportToExcel(
  reportType: ExportReportType,
  params: ExportDateRangeParams,
  filename: string,
): Promise<void> {
  const response = await apiClient.get(`/exports/${reportType}.xlsx`, {
    params,
    responseType: 'blob',
  })
  downloadBlob(response.data as Blob, filename)
}
