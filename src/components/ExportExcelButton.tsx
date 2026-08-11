import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportReportToExcel, type ExportDateRangeParams, type ExportReportType } from '@/features/exports/exports.api'

interface ExportExcelButtonProps {
  reportType: ExportReportType
  params?: ExportDateRangeParams
  filename: string
}

export function ExportExcelButton({ reportType, params = {}, filename }: ExportExcelButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await exportReportToExcel(reportType, params, filename)
    } catch {
      toast.error('Failed to export report')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void handleClick()} disabled={isLoading}>
      <Download className="size-4" />
      {isLoading ? 'Exporting…' : 'Export to Excel'}
    </Button>
  )
}
