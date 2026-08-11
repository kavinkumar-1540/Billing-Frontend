import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { fetchStockMovements } from './inventory.api'
import type { StockMovement } from './inventory.types'

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

export default function StockMovementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'movements'],
    queryFn: () => fetchStockMovements({ limit: 50 }),
  })

  const columns: DataTableColumn<StockMovement>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (m) => new Date(m.createdAt).toLocaleString('en-IN'),
    },
    { key: 'type', header: 'Movement Type', render: (m) => toTitleCase(m.movementType) },
    {
      key: 'direction',
      header: 'Direction',
      render: (m) => (
        <Badge variant={m.direction === 'IN' ? 'success' : 'destructive'}>
          {m.direction === 'IN' ? 'Stock In' : 'Stock Out'}
        </Badge>
      ),
    },
    { key: 'quantity', header: 'Quantity', align: 'right', render: (m) => m.quantity },
    { key: 'reference', header: 'Reference', render: (m) => m.refDocType ?? '—' },
  ]

  return (
    <div>
      <PageHeader title="Stock Movements" description="Full audit trail of every stock change" />
      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No stock movements yet"
          description="Movements are created automatically from sales, purchases, and manual adjustments."
        />
      ) : (
        <DataTable columns={columns} data={data?.items ?? []} rowKey={(m) => m._id} isLoading={isLoading} />
      )}
    </div>
  )
}