import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createItem, updateItem, fetchCategories, fetchTaxRates } from './items.api'
import type { Item, ItemFormValues } from './items.types'

interface ItemFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Item | null
}

const emptyForm: ItemFormValues = {
  sku: '',
  name: '',
  unit: 'PCS',
  itemType: 'GOODS',
}

export function ItemFormSheet({ open, onOpenChange, editing }: ItemFormSheetProps) {
  const [form, setForm] = useState<ItemFormValues>(emptyForm)
  const queryClient = useQueryClient()

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const { data: taxRates } = useQuery({ queryKey: ['tax-rates'], queryFn: fetchTaxRates })

  useEffect(() => {
    if (editing) {
      setForm({
        sku: editing.sku,
        name: editing.name,
        description: editing.description,
        categoryId: editing.categoryId,
        brand: editing.brand,
        hsnSac: editing.hsnSac,
        unit: editing.unit,
        itemType: editing.itemType,
        purchasePrice: editing.purchasePrice / 100,
        sellingPrice: editing.sellingPrice / 100,
        taxRateId: editing.taxRateId,
        minStock: editing.minStock,
        maxStock: editing.maxStock,
        barcode: editing.barcode,
      })
    } else if (open) {
      setForm(emptyForm)
    }
  }, [editing, open])

  const mutation = useMutation({
    mutationFn: () => (editing ? updateItem(editing._id, form) : createItem(form)),
    onSuccess: () => {
      toast.success(`Item ${editing ? 'updated' : 'created'} successfully`)
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to save item'),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit Item' : 'Add Item'}</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <SheetBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  required
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  required
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Item name *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hsnSac">HSN/SAC</Label>
                <Input
                  id="hsnSac"
                  value={form.hsnSac ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, hsnSac: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="itemType">Type</Label>
                <select
                  id="itemType"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                  value={form.itemType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, itemType: e.target.value as ItemFormValues['itemType'] }))
                  }
                >
                  <option value="GOODS">Goods</option>
                  <option value="SERVICE">Service</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                value={form.categoryId ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value || undefined }))}
              >
                <option value="">No category</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="purchasePrice">Purchase price (₹)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min={0}
                  value={form.purchasePrice ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, purchasePrice: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sellingPrice">Selling price (₹)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min={0}
                  value={form.sellingPrice ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sellingPrice: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxRate">GST rate</Label>
              <select
                id="taxRate"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                value={form.taxRateId ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, taxRateId: e.target.value || undefined }))}
              >
                <option value="">No tax</option>
                {taxRates?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label htmlFor="openingStock">Opening stock</Label>
                <Input
                  id="openingStock"
                  type="number"
                  min={0}
                  value={form.openingStock ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, openingStock: Number(e.target.value) }))
                  }
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="minStock">Min stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min={0}
                  value={form.minStock ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, minStock: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxStock">Max stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min={0}
                  value={form.maxStock ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, maxStock: Number(e.target.value) }))}
                />
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : editing ? 'Save changes' : 'Add Item'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}