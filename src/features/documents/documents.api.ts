import { apiClient } from '@/lib/api-client'

export type PdfDocumentType =
  | 'sales-order'
  | 'sales-invoice'
  | 'purchase-order'
  | 'purchase-bill'
  | 'credit-note'
  | 'debit-note'

export async function fetchDocumentPdfBlob(docType: PdfDocumentType, id: string): Promise<Blob> {
  const response = await apiClient.get(`/documents/${docType}/${id}/pdf`, {
    responseType: 'blob',
  })
  return response.data as Blob
}

export async function emailDocument(docType: PdfDocumentType, id: string, toEmail?: string): Promise<void> {
  await apiClient.post(`/documents/${docType}/${id}/email`, toEmail ? { toEmail } : {})
}
