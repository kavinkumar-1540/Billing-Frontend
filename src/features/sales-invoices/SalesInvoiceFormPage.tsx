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
import { issueSalesInvoice } from './sales-invoices.api'
import { previewDocument, type DraftLine } from './gst-preview.util'

const COMPANY_STATE_CODE = '33' // Tamil Nadu — matches seeded demo company

export default function SalesInvoiceFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [customerId, setCustomerId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [lines, setLines] = useState<DraftLine[]>([{ itemId: '', quantity: 1, rate: 0 }])

  const { data: allCustomers } = useQuery({
    queryKey: ['parties', 'CUSTOMER', 'selector'],
    queryFn: () => fetchParties('CUSTOMER', { limit: 200 }),
  })
  const { data: allItems } = useQuery({ queryKey: ['items', 'selector'], queryFn: () => fetchItems({ limit: 200 }) })
  const { data: taxRates } = useQuery({ queryKey: ['tax-rates'], queryFn: fetchTaxRates })

  const selectedCustomer = allCustomers?.items.find((c) => c._id === customerId)
  const isIntraState = (selectedCustomer?.stateCode ?? '') === COMPANY_STATE_CODE

  const validLines = useMemo(() => lines.filter((l) => l.itemId && l.quantity > 0), [lines])

  const preview = useMemo(
    () => previewDocument(validLines, allItems?.items ?? [], taxRates ?? [], isIntraState),
    [validLines, allItems, taxRates, isIntraState],
  )

  const mutation = useMutation({
    mutationFn: () =>
      issueSalesInvoice({
        customerId,
        invoiceDate,
        items: validLines.map((l) => ({
          itemId: l.itemId,
          quantity: l.quantity,
          rate: l.rate,
          discountPercent: l.discountPercent,
        })),
      }),
    onSuccess: (invoice) => {
      toast.success(`Invoice ${invoice.invoiceNumber} issued`)
      void queryClient.invalidateQueries({ queryKey: ['sales-invoices'] })
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      void navigate('/sales/invoices')
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to issue invoice')
          : 'Failed to issue invoice'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const canSubmit = customerId && validLines.length > 0 && !mutation.isPending

  return (
    <div>
      <PageHeader
        title="New Sales Invoice"
        description="Create a GST-compliant invoice for a customer"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/sales/invoices')}>
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
          <PartySelector partyType="CUSTOMER" label="Customer *" value={customerId} onChange={setCustomerId} required />
          <div className="space-y-1.5">
            <Label htmlFor="invoiceDate">Invoice Date *</Label>
            <Input
              id="invoiceDate"
              type="date"
              required
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Place of Supply</Label>
            <Input disabled value={selectedCustomer?.state ?? '—'} />
          </div>
        </div>

        <InvoiceItemTable lines={lines} previews={preview.lines} onChange={setLines} />

        <div className="flex justify-end">
          <GSTBreakdown preview={preview} />
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background py-4">
          <Button type="button" variant="outline" onClick={() => navigate('/sales/invoices')}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {mutation.isPending ? 'Issuing…' : 'Issue Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}