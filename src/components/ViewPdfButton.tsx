import { useState } from 'react'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { openDocumentPdf, type PdfDocumentType } from '@/features/documents/documents.api'

interface ViewPdfButtonProps {
  docType: PdfDocumentType
  id: string
  size?: 'sm' | 'default'
  variant?: 'outline' | 'secondary' | 'ghost'
}

export function ViewPdfButton({ docType, id, size = 'sm', variant = 'outline' }: ViewPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await openDocumentPdf(docType, id)
    } catch {
      toast.error('Failed to generate PDF')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className="gap-1.5"
      onClick={(e) => {
        e.stopPropagation()
        void handleClick()
      }}
      disabled={isLoading}
    >
      <FileText className="size-4" />
      {isLoading ? 'Opening…' : 'View PDF'}
    </Button>
  )
}
