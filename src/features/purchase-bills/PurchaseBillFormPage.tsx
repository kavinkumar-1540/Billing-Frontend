import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { PartySelector } from '@/components/PartySelector'
import { InvoiceItemTable } from '@/components/InvoiceItemTable'
import { GSTBreakdown } from '@/components/GSTBreakdown'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { fetchParties } from '@/features/parties/parties.api'
import { fetchItems, fetchTaxRates } from '@/features/items/items.api'
import { confirmPurchaseBill } from './purchase-bills.api'
import { previewDocument, type DraftLine } from '@/features/sales-invoices/gst-preview.util'

const COMPANY_STATE_CODE = '33' // Tamil Nadu — matches seeded demo company

export default function PurchaseBillFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [supplierId, setSupplierId] = useState('')
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('')
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
      confirmPurchaseBill({
        supplierId,
        billDate,
        supplierInvoiceNumber: supplierInvoiceNumber || undefined,
        items: validLines.map((l) => ({
          itemId: l.itemId,
          quantity: l.quantity,
          rate: l.rate,
          discountPercent: l.discountPercent,
        })),
      }),
    onSuccess: (bill) => {
      toast.success(`Bill ${bill.billNumber} confirmed`)
      void queryClient.invalidateQueries({ queryKey: ['purchase-bills'] })
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      void navigate('/purchases/bills')
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to confirm bill')
          : 'Failed to confirm bill'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const canSubmit = supplierId && validLines.length > 0 && !mutation.isPending

  return (
    <div>
      <PageHeader
        title="New Purchase Bill"
        description="Record a supplier bill and update inventory"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/purchases/bills')}>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PartySelector partyType="SUPPLIER" label="Supplier *" value={supplierId} onChange={setSupplierId} required />
          <div className="space-y-1.5">
            <Label htmlFor="billDate">Bill Date *</Label>
            <Input
              id="billDate"
              type="date"
              required
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplierInvoiceNumber">Supplier Invoice #</Label>
            <Input
              id="supplierInvoiceNumber"
              value={supplierInvoiceNumber}
              onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
            />
          </div>
        </div>

        <InvoiceItemTable lines={lines} previews={preview.lines} onChange={setLines} />

        <div className="flex justify-end">
          <GSTBreakdown preview={preview} />
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background py-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchases/bills')}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {mutation.isPending ? 'Confirming…' : 'Confirm Bill'}
          </Button>
        </div>
      </form>
    </div>
  )
}
