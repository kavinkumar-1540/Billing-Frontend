import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Boxes } from 'lucide-react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatTile } from '@/components/StatTile'
import { EmptyState } from '@/components/EmptyState'
import { fetchStockLevels } from './inventory.api'
import type { Item } from '@/features/items/items.types'

export default function StockPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'stock', debouncedSearch],
    queryFn: () => fetchStockLevels({ search: debouncedSearch || undefined, limit: 50 }),
  })

  const items = data?.items ?? []
  const totalStockValue = items.reduce((sum, i) => sum + i.currentStock * i.purchasePrice, 0)
  const lowStockCount = items.filter((i) => i.currentStock <= i.minStock).length

  const columns: DataTableColumn<Item>[] = [
    {
      key: 'name',
      header: 'Item',
      render: (i) => (
        <div>
          <div className="font-medium">{i.name}</div>
          <div className="text-xs text-muted-foreground">{i.sku}</div>
        </div>
      ),
    },
    { key: 'unit', header: 'Unit', render: (i) => i.unit },
    {
      key: 'currentStock',
      header: 'Current Stock',
      align: 'right',
      render: (i) => (
        <span className={i.currentStock <= i.minStock ? 'font-medium text-destructive' : ''}>
          {i.currentStock}
        </span>
      ),
    },
    { key: 'minStock', header: 'Min Stock', align: 'right', render: (i) => i.minStock },
    {
      key: 'stockValue',
      header: 'Stock Value',
      align: 'right',
      render: (i) => <MoneyDisplay paise={i.currentStock * i.purchasePrice} />,
    },
  ]

  return (
    <div>
      <PageHeader title="Stock" description="Current stock levels and valuation across all items" />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total Stock Value" value={`₹${(totalStockValue / 100 / 100000).toFixed(1)}L`} icon={Boxes} />
        <StatTile label="Items Tracked" value={String(items.length)} icon={Boxes} />
        <StatTile label="Low Stock Items" value={String(lowStockCount)} icon={Boxes} />
      </div>

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search items…" />
      </div>

      {!isLoading && items.length === 0 && !debouncedSearch ? (
        <EmptyState icon={Boxes} title="No stock to show" description="Add items with opening stock to see them here." />
      ) : (
        <DataTable columns={columns} data={items} rowKey={(i) => i._id} isLoading={isLoading} />
      )}
    </div>
  )
}