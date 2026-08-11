import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { fetchPaymentReport } from './reports.api'
import type { PaymentReportRow } from './reports.types'

export default function PaymentReportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'payments', from, to],
    queryFn: () => fetchPaymentReport({ from: from || undefined, to: to || undefined }),
  })

  const totals = useMemo(() => {
    const receipts = (data ?? []).filter((r) => r.paymentType === 'RECEIPT').reduce((sum, r) => sum + r.totalAmount, 0)
    const payments = (data ?? []).filter((r) => r.paymentType === 'PAYMENT').reduce((sum, r) => sum + r.totalAmount, 0)
    return { receipts, payments }
  }, [data])

  const columns: DataTableColumn<PaymentReportRow>[] = [
    { key: 'date', header: 'Date', render: (r) => new Date(r.date).toLocaleDateString('en-IN') },
    { key: 'type', header: 'Type', render: (r) => <StatusBadge status={r.paymentType} /> },
    { key: 'method', header: 'Method', render: (r) => r.method },
    { key: 'count', header: 'Count', align: 'right', render: (r) => r.count },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => <MoneyDisplay paise={r.totalAmount} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Payment Report"
        description="Customer receipts and supplier payments over time"
        actions={<ExportExcelButton reportType="payments" params={{ from: from || undefined, to: to || undefined }} filename="payment-report.xlsx" />}
      />
      <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      {!isLoading && data?.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments in this period" />
      ) : (
        <>
          <DataTable columns={columns} data={data ?? []} rowKey={(r) => `${r.date}-${r.paymentType}-${r.method}`} isLoading={isLoading} />
          {data && data.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-sm space-y-1.5 rounded-lg border bg-card p-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Receipts</span>
                  <MoneyDisplay paise={totals.receipts} />
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Payments</span>
                  <MoneyDisplay paise={totals.payments} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
