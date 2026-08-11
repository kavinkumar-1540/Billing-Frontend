import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { EmptyState } from '@/components/EmptyState'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { fetchOutstandingReport } from './reports.api'
import type { OutstandingReportRow } from './reports.types'

export default function OutstandingReportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'outstanding'],
    queryFn: fetchOutstandingReport,
  })

  const totals = useMemo(() => {
    const receivable = (data ?? []).filter((r) => r.currentOutstanding > 0).reduce((sum, r) => sum + r.currentOutstanding, 0)
    const payable = (data ?? []).filter((r) => r.currentOutstanding < 0).reduce((sum, r) => sum + r.currentOutstanding, 0)
    return { receivable, payable }
  }, [data])

  const columns: DataTableColumn<OutstandingReportRow>[] = [
    { key: 'name', header: 'Party', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'type', header: 'Type', render: (r) => r.partyType },
    { key: 'gstin', header: 'GSTIN', render: (r) => r.gstin ?? '—' },
    {
      key: 'outstanding',
      header: 'Outstanding',
      align: 'right',
      render: (r) => (
        <MoneyDisplay paise={Math.abs(r.currentOutstanding)} className={r.currentOutstanding > 0 ? 'text-destructive' : ''} />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Outstanding Report"
        description="Amounts receivable from customers and payable to suppliers"
        actions={<ExportExcelButton reportType="outstanding" filename="outstanding-report.xlsx" />}
      />

      {!isLoading && data?.length === 0 ? (
        <EmptyState icon={Wallet} title="No outstanding balances" />
      ) : (
        <>
          <DataTable columns={columns} data={data ?? []} rowKey={(r) => r.partyId} isLoading={isLoading} />
          {data && data.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-sm space-y-1.5 rounded-lg border bg-card p-4 text-sm">
                <div className="flex justify-between text-destructive">
                  <span>Total Receivable</span>
                  <MoneyDisplay paise={totals.receivable} />
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Payable</span>
                  <MoneyDisplay paise={Math.abs(totals.payable)} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
