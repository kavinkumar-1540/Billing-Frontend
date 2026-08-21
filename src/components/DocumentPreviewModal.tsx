import { useEffect, useState } from 'react'
import { Download, Loader2, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { fetchDocumentPdfBlob, type PdfDocumentType } from '@/features/documents/documents.api'

interface DocumentPreviewModalProps {
  docType: PdfDocumentType
  id: string
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreviewModal({ docType, id, title, open, onOpenChange }: DocumentPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let objectUrl: string | null = null
    setIsLoading(true)
    setError(null)
    fetchDocumentPdfBlob(docType, id)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch((err: unknown) => {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
              'Failed to load document.')
            : 'Failed to load document.'
        setError(Array.isArray(message) ? message.join(', ') : message)
      })
      .finally(() => setIsLoading(false))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setBlobUrl(null)
    }
  }, [open, docType, id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle>{title}</DialogTitle>
            <p className="text-xs text-slate-400">Official GST Printable Document</p>
          </div>
          <div className="mr-8 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!blobUrl}
              onClick={() => {
                const win = window.open(blobUrl ?? undefined, '_blank')
                win?.print()
              }}
            >
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!blobUrl}
              onClick={() => {
                if (!blobUrl) return
                const link = document.createElement('a')
                link.href = blobUrl
                link.download = `${title}.pdf`
                link.click()
              }}
            >
              <Download className="size-3.5" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-[75vh] items-center justify-center bg-slate-950/40 p-4">
          {isLoading ? (
            <Loader2 className="size-6 animate-spin text-cyan-400" />
          ) : blobUrl ? (
            <iframe src={blobUrl} title={title} className="h-full w-full rounded-xl border border-white/10 bg-white" />
          ) : (
            <p className="text-sm text-slate-400">{error ?? 'Failed to load document.'}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
