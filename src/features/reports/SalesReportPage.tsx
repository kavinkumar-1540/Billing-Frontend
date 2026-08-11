import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { EmptyState } from '@/components/EmptyState'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { fetchSalesReport } from './reports.api'
import type { SalesReportRow } from './reports.types'

export default function SalesReportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'sales', from, to],
    queryFn: () => fetchSalesReport({ from: from || undefined, to: to || undefined }),
  })

  const totals = useMemo(
    () =>
      (data ?? []).reduce(
        (acc, row) => ({
          invoiceCount: acc.invoiceCount + row.invoiceCount,
          taxableAmount: acc.taxableAmount + row.taxableAmount,
          totalTax: acc.totalTax + row.totalTax,
          grandTotal: acc.grandTotal + row.grandTotal,
        }),
        { invoiceCount: 0, taxableAmount: 0, totalTax: 0, grandTotal: 0 },
      ),
    [data],
  )

  const columns: DataTableColumn<SalesReportRow>[] = [
    { key: 'date', header: 'Date', render: (r) => new Date(r.date).toLocaleDateString('en-IN') },
    { key: 'count', header: 'Invoices', align: 'right', render: (r) => r.invoiceCount },
    { key: 'taxable', header: 'Taxable Amount', align: 'right', render: (r) => <MoneyDisplay paise={r.taxableAmount} /> },
    { key: 'tax', header: 'Total Tax', align: 'right', render: (r) => <MoneyDisplay paise={r.totalTax} /> },
    { key: 'total', header: 'Grand Total', align: 'right', render: (r) => <MoneyDisplay paise={r.grandTotal} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Sales Report"
        description="Daily sales totals with GST breakdown"
        actions={<ExportExcelButton reportType="sales" params={{ from: from || undefined, to: to || undefined }} filename="sales-report.xlsx" />}
      />
      <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      {!isLoading && data?.length === 0 ? (
        <EmptyState icon={BarChart3} title="No sales in this period" />
      ) : (
        <>
          <DataTable columns={columns} data={data ?? []} rowKey={(r) => r.date} isLoading={isLoading} />
          {data && data.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-sm space-y-1.5 rounded-lg border bg-card p-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Invoices</span>
                  <span>{totals.invoiceCount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxable Amount</span>
                  <MoneyDisplay paise={totals.taxableAmount} />
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Tax</span>
                  <MoneyDisplay paise={totals.totalTax} />
                </div>
                <div className="border-t pt-1.5 flex justify-between font-semibold">
                  <span>Grand Total</span>
                  <MoneyDisplay paise={totals.grandTotal} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
