import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MoreHorizontal, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/EmptyState'
import { fetchItems, deactivateItem } from './items.api'
import { ItemFormSheet } from './ItemFormSheet'
import type { Item } from './items.types'

export default function ItemsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['items', debouncedSearch],
    queryFn: () => fetchItems({ search: debouncedSearch || undefined }),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateItem,
    onSuccess: () => {
      toast.success('Item deactivated')
      void queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

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
    { key: 'hsn', header: 'HSN/SAC', render: (i) => i.hsnSac ?? '—' },
    { key: 'unit', header: 'Unit', render: (i) => i.unit },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (i) =>
        i.itemType === 'SERVICE' ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className={i.currentStock <= i.minStock ? 'font-medium text-destructive' : ''}>
            {i.currentStock}
          </span>
        ),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      align: 'right',
      render: (i) => <MoneyDisplay paise={i.sellingPrice} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (i) => (
        <Badge variant={i.isActive ? 'success' : 'secondary'}>
          {i.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setEditing(i)
                setSheetOpen(true)
              }}
            >
              Edit
            </DropdownMenuItem>
            {i.isActive && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  deactivateMutation.mutate(i._id)
                }}
              >
                Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Items"
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditing(null)
              setSheetOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add Item
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search items…" />
      </div>

      {!isLoading && data?.items.length === 0 && !debouncedSearch ? (
        <EmptyState
          icon={Package}
          title="No items yet"
          description="Add your first product or service to start billing against it."
          action={
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              Add Item
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          rowKey={(i) => i._id}
          isLoading={isLoading}
          emptyTitle="No items match your search"
          onRowClick={(i) => {
            setEditing(i)
            setSheetOpen(true)
          }}
        />
      )}

      <ItemFormSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} />
    </div>
  )
}