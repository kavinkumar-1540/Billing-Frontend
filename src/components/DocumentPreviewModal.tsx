import { useEffect, useState } from 'react'
import { Download, Loader2, Mail, Printer } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { emailDocument, fetchDocumentPdfBlob, type PdfDocumentType } from '@/features/documents/documents.api'

interface DocumentPreviewModalProps {
  docType: PdfDocumentType
  id: string
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-fills the recipient email in the "Email to Customer" prompt, if known by the caller. */
  partyEmail?: string
}

export function DocumentPreviewModal({
  docType,
  id,
  title,
  open,
  onOpenChange,
  partyEmail,
}: DocumentPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)
  const [toEmail, setToEmail] = useState('')

  const emailMutation = useMutation({
    mutationFn: () => emailDocument(docType, id, toEmail || undefined),
    onSuccess: () => {
      toast.success('Document emailed successfully')
      setShowEmailPrompt(false)
    },
    onError: () => {
      toast.error('Failed to email document')
    },
  })

  useEffect(() => {
    if (!open) return
    setShowEmailPrompt(false)
    setToEmail(partyEmail ?? '')
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
  }, [open, docType, id, partyEmail])

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
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowEmailPrompt((v) => !v)}
            >
              <Mail className="size-3.5" />
              Email to Customer
            </Button>
          </div>
        </DialogHeader>

        {showEmailPrompt && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
            <Input
              type="email"
              placeholder="customer@example.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              disabled={emailMutation.isPending}
              onClick={() => emailMutation.mutate()}
            >
              {emailMutation.isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        )}

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
