import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet'
import { fetchItems } from '@/features/items/items.api'
import { fetchStockMovements, createStockAdjustment } from './inventory.api'
import type { StockAdjustmentFormValues, StockDirection, StockMovement } from './inventory.types'

const emptyForm: StockAdjustmentFormValues = {
  itemId: '',
  direction: 'IN',
  quantity: 1,
  reason: '',
}

export default function StockAdjustmentsPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<StockAdjustmentFormValues>(emptyForm)
  const queryClient = useQueryClient()

  const { data: adjustments, isLoading } = useQuery({
    queryKey: ['inventory', 'movements', 'ADJUSTMENT'],
    queryFn: () => fetchStockMovements({ limit: 50 }),
    select: (result) => ({
      ...result,
      items: result.items.filter((m) => m.movementType === 'ADJUSTMENT'),
    }),
  })

  const { data: itemOptions } = useQuery({
    queryKey: ['items', 'for-adjustment'],
    queryFn: () => fetchItems({ limit: 100 }),
  })

  const mutation = useMutation({
    mutationFn: () => createStockAdjustment(form),
    onSuccess: () => {
      toast.success('Stock adjustment recorded')
      void queryClient.invalidateQueries({ queryKey: ['inventory'] })
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      setOpen(false)
      setForm(emptyForm)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to record adjustment')
          : 'Failed to record adjustment'
      toast.error(message)
    },
  })

  const columns: DataTableColumn<StockMovement>[] = [
    { key: 'date', header: 'Date', render: (m) => new Date(m.createdAt).toLocaleString('en-IN') },
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
  ]

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        description="Manually correct stock levels with a recorded reason"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New Adjustment
          </Button>
        }
      />

      {!isLoading && adjustments?.items.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No adjustments recorded"
          description="Use this when physical stock counts differ from the system quantity."
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              New Adjustment
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={adjustments?.items ?? []}
          rowKey={(m) => m._id}
          isLoading={isLoading}
        />
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Stock Adjustment</SheetTitle>
          </SheetHeader>
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
          >
            <SheetBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="item">Item *</Label>
                <select
                  id="item"
                  required
                  className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                  value={form.itemId}
                  onChange={(e) => setForm((f) => ({ ...f, itemId: e.target.value }))}
                >
                  <option value="">Select item</option>
                  {itemOptions?.items.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name} ({i.sku}) — current: {i.currentStock}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="direction">Direction *</Label>
                <select
                  id="direction"
                  className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                  value={form.direction}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, direction: e.target.value as StockDirection }))
                  }
                >
                  <option value="IN">Stock In (increase)</option>
                  <option value="OUT">Stock Out (decrease)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  required
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  required
                  minLength={3}
                  placeholder="e.g. Physical count correction"
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Record Adjustment'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}