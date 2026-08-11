import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Truck } from 'lucide-react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { ViewPdfButton } from '@/components/ViewPdfButton'
import { fetchPurchaseBills } from './purchase-bills.api'
import type { PurchaseBill } from './purchase-bills.types'

export default function PurchaseBillsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-bills', debouncedSearch],
    queryFn: () => fetchPurchaseBills({ search: debouncedSearch || undefined }),
  })

  const columns: DataTableColumn<PurchaseBill>[] = [
    { key: 'number', header: 'Bill #', render: (b) => <span className="font-medium">{b.billNumber}</span> },
    { key: 'date', header: 'Date', render: (b) => new Date(b.billDate).toLocaleDateString('en-IN') },
    { key: 'supplier', header: 'Supplier', render: (b) => b.supplierSnapshot.name },
    {
      key: 'grandTotal',
      header: 'Total',
      align: 'right',
      render: (b) => <MoneyDisplay paise={b.taxSummary.grandTotal} />,
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      align: 'right',
      render: (b) => <MoneyDisplay paise={b.balanceDue} className={b.balanceDue > 0 ? 'text-destructive' : ''} />,
    },
    { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    {
      key: 'pdf',
      header: '',
      align: 'right',
      render: (b) => <ViewPdfButton docType="purchase-bill" id={b._id} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Purchase Bills"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/purchases/bills/new')}>
            <Plus className="size-4" />
            New Bill
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search bill number or supplier…" />
      </div>

      {!isLoading && data?.items.length === 0 && !debouncedSearch ? (
        <EmptyState
          icon={Truck}
          title="No purchase bills found"
          description="Record your first supplier bill to update inventory and track payables."
          action={
            <Button size="sm" onClick={() => navigate('/purchases/bills/new')}>
              Confirm Bill
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          rowKey={(b) => b._id}
          isLoading={isLoading}
          emptyTitle="No bills match your search"
        />
      )}
    </div>
  )
}
