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
import { fetchSalesOrders } from './sales-orders.api'
import type { SalesOrder } from './sales-orders.types'

export default function SalesOrdersPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => fetchSalesOrders({ limit: 50 }),
  })

  const columns: DataTableColumn<SalesOrder>[] = [
    { key: 'number', header: 'Order #', render: (o) => <span className="font-medium">{o.orderNumber}</span> },
    { key: 'date', header: 'Date', render: (o) => new Date(o.orderDate).toLocaleDateString('en-IN') },
    { key: 'customer', header: 'Customer', render: (o) => o.customerSnapshot.name },
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
      render: (o) => <ViewPdfButton docType="sales-order" id={o._id} title={o.orderNumber} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Sales Quotation"
        description="Orders confirmed with a customer, pending invoicing"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/sales/orders/new')}>
            <Plus className="size-4" />
            New Quotation
          </Button>
        }
      />
      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No sales quotations yet"
          description="Sales quotations convert into invoices once confirmed with the customer."
          action={
            <Button size="sm" onClick={() => navigate('/sales/orders/new')}>
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