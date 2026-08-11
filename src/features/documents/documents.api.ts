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

export function openDocumentPdf(docType: PdfDocumentType, id: string): Promise<void> {
  return fetchDocumentPdfBlob(docType, id).then((blob) => {
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  })
}
