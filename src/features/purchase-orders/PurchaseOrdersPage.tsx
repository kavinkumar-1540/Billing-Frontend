import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ViewPdfButton } from '@/components/ViewPdfButton'
import { Button } from '@/components/ui/button'
import { fetchPurchaseOrders } from './purchase-orders.api'
import type { PurchaseOrder } from './purchase-orders.types'

export default function PurchaseOrdersPage() {
  const navigate = useNavigate()
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
      render: (o) => <ViewPdfButton docType="purchase-order" id={o._id} title={o.poNumber} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Purchase Quotation"
        description="Orders confirmed with a supplier, pending billing"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/purchases/orders/new')}>
            <Plus className="size-4" />
            New Quotation
          </Button>
        }
      />
      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No purchase quotations yet"
          description="Purchase quotations convert into invoices once goods are received."
          action={
            <Button size="sm" onClick={() => navigate('/purchases/orders/new')}>
              Create Quotation
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={data?.items ?? []} rowKey={(o) => o._id} isLoading={isLoading} />
      )}
    </div>
  )
}
