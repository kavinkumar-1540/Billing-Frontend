import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { fetchGstReport } from './reports.api'
import type { GstReportRow } from './reports.types'

function gstColumns(): DataTableColumn<GstReportRow>[] {
  return [
    { key: 'rate', header: 'GST Rate', render: (r) => `${r.gstRatePercent}%` },
    { key: 'taxable', header: 'Taxable', align: 'right', render: (r) => <MoneyDisplay paise={r.taxableAmount} /> },
    { key: 'cgst', header: 'CGST', align: 'right', render: (r) => <MoneyDisplay paise={r.cgst} /> },
    { key: 'sgst', header: 'SGST', align: 'right', render: (r) => <MoneyDisplay paise={r.sgst} /> },
    { key: 'igst', header: 'IGST', align: 'right', render: (r) => <MoneyDisplay paise={r.igst} /> },
    { key: 'cess', header: 'Cess', align: 'right', render: (r) => <MoneyDisplay paise={r.cess} /> },
    { key: 'total', header: 'Total', align: 'right', render: (r) => <MoneyDisplay paise={r.total} /> },
  ]
}

export default function GstReportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'gst', from, to],
    queryFn: () => fetchGstReport({ from: from || undefined, to: to || undefined }),
  })

  const columns = gstColumns()

  return (
    <div>
      <PageHeader
        title="GST Report"
        description="Output (sales) and input (purchase) GST, grouped by rate slab"
        actions={<ExportExcelButton reportType="gst" params={{ from: from || undefined, to: to || undefined }} filename="gst-report.xlsx" />}
      />
      <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Output GST (Sales)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable columns={columns} data={data?.sales ?? []} rowKey={(r) => String(r.gstRatePercent)} isLoading={isLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input GST (Purchases)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={data?.purchases ?? []}
              rowKey={(r) => String(r.gstRatePercent)}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
