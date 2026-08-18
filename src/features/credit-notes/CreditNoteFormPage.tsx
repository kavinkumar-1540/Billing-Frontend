import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { InvoiceItemTable } from '@/components/InvoiceItemTable'
import { GSTBreakdown } from '@/components/GSTBreakdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { fetchSalesInvoices } from '@/features/sales-invoices/sales-invoices.api'
import { fetchItems, fetchTaxRates } from '@/features/items/items.api'
import { issueCreditNote } from './credit-notes.api'
import { previewDocument, type DraftLine } from '@/features/sales-invoices/gst-preview.util'

const COMPANY_STATE_CODE = '33'

export default function CreditNoteFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [originalInvoiceId, setOriginalInvoiceId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([])

  const { data: invoices } = useQuery({
    queryKey: ['sales-invoices', 'for-credit-note'],
    queryFn: () => fetchSalesInvoices({ limit: 200 }),
  })
  const { data: allItems } = useQuery({ queryKey: ['items', 'selector'], queryFn: () => fetchItems({ limit: 200 }) })
  const { data: taxRates } = useQuery({ queryKey: ['tax-rates'], queryFn: fetchTaxRates })

  const selectedInvoice = invoices?.items.find((i) => i._id === originalInvoiceId)
  const isIntraState = (selectedInvoice?.customerSnapshot.stateCode ?? '') === COMPANY_STATE_CODE

  useEffect(() => {
    if (selectedInvoice) {
      setLines(
        selectedInvoice.items.map((line) => ({
          itemId: line.itemId ?? '',
          quantity: line.quantity,
          rate: line.rate / 100,
        })),
      )
    } else {
      setLines([])
    }
  }, [selectedInvoice])

  const validLines = useMemo(() => lines.filter((l) => l.itemId && l.quantity > 0), [lines])

  const preview = useMemo(
    () => previewDocument(validLines, allItems?.items ?? [], taxRates ?? [], isIntraState),
    [validLines, allItems, taxRates, isIntraState],
  )

  const mutation = useMutation({
    mutationFn: () =>
      issueCreditNote({
        originalInvoiceId,
        date,
        reason,
        items: validLines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, rate: l.rate })),
      }),
    onSuccess: (note) => {
      toast.success(`Credit note ${note.noteNumber} issued`)
      void queryClient.invalidateQueries({ queryKey: ['credit-notes'] })
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      void queryClient.invalidateQueries({ queryKey: ['parties'] })
      void navigate('/sales/credit-notes')
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to issue credit note')
          : 'Failed to issue credit note'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const canSubmit = originalInvoiceId && reason.length >= 3 && validLines.length > 0 && !mutation.isPending

  return (
    <div>
      <PageHeader
        title="New Credit Note"
        description="Issue a credit note against an original sales invoice"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/sales/credit-notes')}>
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
            <div className="space-y-1.5">
              <Label htmlFor="originalInvoice" className="text-xs font-semibold text-slate-300">
                Original Invoice *
              </Label>
              <select
                id="originalInvoice"
                required
                className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                value={originalInvoiceId}
                onChange={(e) => setOriginalInvoiceId(e.target.value)}
              >
                <option value="">Select invoice</option>
                {invoices?.items.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} — {inv.customerSnapshot.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold text-slate-300">
                Date *
              </Label>
              <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-semibold text-slate-300">
                Reason *
              </Label>
              <Input
                id="reason"
                required
                minLength={3}
                placeholder="e.g. Damaged goods returned"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {originalInvoiceId && (
          <>
            <InvoiceItemTable lines={lines} previews={preview.lines} onChange={setLines} />
            <div className="flex justify-end">
              <GSTBreakdown preview={preview} />
            </div>
          </>
        )}

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-white/10 bg-slate-950/85 py-4 backdrop-blur-xl">
          <Button type="button" variant="outline" onClick={() => navigate('/sales/credit-notes')}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {mutation.isPending ? 'Issuing…' : 'Issue Credit Note'}
          </Button>
        </div>
      </form>
    </div>
  )
}
