import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { fetchReceipts, fetchSupplierPayments } from './payments.api'
import { PaymentFormSheet } from './PaymentFormSheet'
import type { Payment, PaymentType } from './payments.types'

interface PaymentListPageProps {
  paymentType: PaymentType
  title: string
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

export function PaymentListPage({ paymentType, title }: PaymentListPageProps) {
  const [open, setOpen] = useState(false)
  const isReceipt = paymentType === 'RECEIPT'

  const { data, isLoading } = useQuery({
    queryKey: ['payments', paymentType],
    queryFn: () => (isReceipt ? fetchReceipts({ limit: 50 }) : fetchSupplierPayments({ limit: 50 })),
  })

  const columns: DataTableColumn<Payment>[] = [
    { key: 'number', header: 'Payment #', render: (p) => <span className="font-medium">{p.paymentNumber}</span> },
    { key: 'date', header: 'Date', render: (p) => new Date(p.date).toLocaleDateString('en-IN') },
    { key: 'method', header: 'Method', render: (p) => toTitleCase(p.method) },
    { key: 'reference', header: 'Reference', render: (p) => p.referenceNumber ?? '—' },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => <MoneyDisplay paise={p.amount} /> },
  ]

  return (
    <div>
      <PageHeader
        title={title}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Record {isReceipt ? 'Receipt' : 'Payment'}
          </Button>
        }
      />

      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={`No ${title.toLowerCase()} yet`}
          description={
            isReceipt
              ? 'Record a customer payment against outstanding invoices.'
              : 'Record a payment to a supplier against outstanding bills.'
          }
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Record {isReceipt ? 'Receipt' : 'Payment'}
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={data?.items ?? []} rowKey={(p) => p._id} isLoading={isLoading} />
      )}

      <PaymentFormSheet paymentType={paymentType} open={open} onOpenChange={setOpen} />
    </div>
  )
}
