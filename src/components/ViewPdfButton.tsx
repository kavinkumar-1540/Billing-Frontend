import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PdfDocumentType } from '@/features/documents/documents.api'
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal'

interface ViewPdfButtonProps {
  docType: PdfDocumentType
  id: string
  title?: string
  size?: 'sm' | 'default'
  variant?: 'outline' | 'secondary' | 'ghost'
}

export function ViewPdfButton({ docType, id, title = 'Document', size = 'sm', variant = 'outline' }: ViewPdfButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className="gap-1.5"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
        }}
      >
        <FileText className="size-4" />
        View PDF
      </Button>
      <DocumentPreviewModal docType={docType} id={id} title={title} open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
