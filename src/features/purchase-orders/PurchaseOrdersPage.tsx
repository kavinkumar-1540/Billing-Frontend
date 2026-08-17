import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ViewPdfButton } from '@/components/ViewPdfButton'
import { fetchPurchaseOrders } from './purchase-orders.api'
import type { PurchaseOrder } from './purchase-orders.types'

export default function PurchaseOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => fetchPurchaseOrders({ limit: 50 }),
  })

  const columns: DataTableColumn<PurchaseOrder>[] = [
    { key: 'number', header: 'Order #', render: (o) => <span className="font-medium">{o.poNumber}</span> },
    { key: 'date', header: 'Date', render: (o) => new Date(o.orderDate).toLocaleDateString('en-IN') },
    { key: 'supplier', header: 'Supplier', render: (o) => o.supplierSnapshot.name },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (o) => <MoneyDisplay paise={o.taxSummary.grandTotal} />,
    },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    {
      key: 'pdf',
      header: '',
      align: 'right',
      render: (o) => <ViewPdfButton docType="purchase-order" id={o._id} />,
    },
  ]

  return (
    <div>
      <PageHeader title="Purchase Quotation" description="Orders confirmed with a supplier, pending billing" />
      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No purchase quotations yet"
          description="Purchase quotations convert into invoices once goods are received."
        />
      ) : (
        <DataTable columns={columns} data={data?.items ?? []} rowKey={(o) => o._id} isLoading={isLoading} />
      )}
    </div>
  )
}
