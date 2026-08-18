import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, ReceiptText } from 'lucide-react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { ViewPdfButton } from '@/components/ViewPdfButton'
import { fetchSalesInvoices } from './sales-invoices.api'
import type { SalesInvoice } from './sales-invoices.types'

export default function SalesInvoicesPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['sales-invoices', debouncedSearch],
    queryFn: () => fetchSalesInvoices({ search: debouncedSearch || undefined }),
  })

  const columns: DataTableColumn<SalesInvoice>[] = [
    { key: 'number', header: 'Invoice #', render: (i) => <span className="font-medium">{i.invoiceNumber}</span> },
    { key: 'date', header: 'Date', render: (i) => new Date(i.invoiceDate).toLocaleDateString('en-IN') },
    { key: 'customer', header: 'Customer', render: (i) => i.customerSnapshot.name },
    { key: 'placeOfSupply', header: 'Place of Supply', render: (i) => i.placeOfSupply },
    {
      key: 'grandTotal',
      header: 'Total',
      align: 'right',
      render: (i) => <MoneyDisplay paise={i.taxSummary.grandTotal} />,
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      align: 'right',
      render: (i) => <MoneyDisplay paise={i.balanceDue} className={i.balanceDue > 0 ? 'text-destructive' : ''} />,
    },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    {
      key: 'pdf',
      header: '',
      align: 'right',
      render: (i) => <ViewPdfButton docType="sales-invoice" id={i._id} title={i.invoiceNumber} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Sales Invoices"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/sales/invoices/new')}>
            <Plus className="size-4" />
            New Invoice
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoice number or customer…" />
      </div>

      {!isLoading && data?.items.length === 0 && !debouncedSearch ? (
        <EmptyState
          icon={ReceiptText}
          title="No invoices found"
          description="Create your first sales invoice to start billing customers."
          action={
            <Button size="sm" onClick={() => navigate('/sales/invoices/new')}>
              Create Invoice
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          rowKey={(i) => i._id}
          isLoading={isLoading}
          emptyTitle="No invoices match your search"
          onRowClick={(i) => navigate(`/sales/invoices/${i._id}`)}
        />
      )}
    </div>
  )
}