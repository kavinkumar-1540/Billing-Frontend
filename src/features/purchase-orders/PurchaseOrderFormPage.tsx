import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { PartySelector } from '@/components/PartySelector'
import { InvoiceItemTable } from '@/components/InvoiceItemTable'
import { GSTBreakdown } from '@/components/GSTBreakdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { fetchParties } from '@/features/parties/parties.api'
import { fetchItems, fetchTaxRates } from '@/features/items/items.api'
import { createPurchaseOrder } from './purchase-orders.api'
import { previewDocument, type DraftLine } from '@/features/sales-invoices/gst-preview.util'

const COMPANY_STATE_CODE = '33' // Tamil Nadu — matches seeded demo company

export default function PurchaseOrderFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [supplierId, setSupplierId] = useState('')
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [lines, setLines] = useState<DraftLine[]>([{ itemId: '', quantity: 1, rate: 0 }])

  const { data: allSuppliers } = useQuery({
    queryKey: ['parties', 'SUPPLIER', 'selector'],
    queryFn: () => fetchParties('SUPPLIER', { limit: 200 }),
  })
  const { data: allItems } = useQuery({ queryKey: ['items', 'selector'], queryFn: () => fetchItems({ limit: 200 }) })
  const { data: taxRates } = useQuery({ queryKey: ['tax-rates'], queryFn: fetchTaxRates })

  const selectedSupplier = allSuppliers?.items.find((s) => s._id === supplierId)
  const isIntraState = (selectedSupplier?.stateCode ?? '') === COMPANY_STATE_CODE

  const validLines = useMemo(() => lines.filter((l) => l.itemId && l.quantity > 0), [lines])

  const preview = useMemo(
    () => previewDocument(validLines, allItems?.items ?? [], taxRates ?? [], isIntraState),
    [validLines, allItems, taxRates, isIntraState],
  )

  const mutation = useMutation({
    mutationFn: () =>
      createPurchaseOrder({
        supplierId,
        orderDate,
        items: validLines.map((l) => ({
          itemId: l.itemId,
          quantity: l.quantity,
          rate: l.rate,
          discountPercent: l.discountPercent,
        })),
      }),
    onSuccess: (order) => {
      toast.success(`Purchase quotation ${order.poNumber} created`)
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      void navigate('/purchases/orders')
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to create purchase quotation')
          : 'Failed to create purchase quotation'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const canSubmit = supplierId && validLines.length > 0 && !mutation.isPending

  return (
    <div>
      <PageHeader
        title="New Purchase Quotation"
        description="Create a quotation with a supplier, pending confirmation and billing"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/purchases/orders')}>
            Cancel
          </Button>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
        className="space-y-6"
      >
        <Card className="p-6">
          <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-3">
            <PartySelector partyType="SUPPLIER" label="Supplier *" value={supplierId} onChange={setSupplierId} required />
            <div className="space-y-1.5">
              <Label htmlFor="orderDate" className="text-xs font-semibold text-slate-300">
                Quotation Date *
              </Label>
              <Input
                id="orderDate"
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Place of Supply</Label>
              <Input disabled value={selectedSupplier?.state ?? '—'} />
            </div>
          </CardContent>
        </Card>

        <InvoiceItemTable lines={lines} previews={preview.lines} onChange={setLines} />

        <div className="flex justify-end">
          <GSTBreakdown preview={preview} />
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-white/10 bg-slate-950/85 py-4 backdrop-blur-xl">
          <Button type="button" variant="outline" onClick={() => navigate('/purchases/orders')}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {mutation.isPending ? 'Creating…' : 'Create Quotation'}
          </Button>
        </div>
      </form>
    </div>
  )
}
