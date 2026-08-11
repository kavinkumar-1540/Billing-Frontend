import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { InvoiceItemTable } from '@/components/InvoiceItemTable'
import { GSTBreakdown } from '@/components/GSTBreakdown'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { fetchPurchaseBills } from '@/features/purchase-bills/purchase-bills.api'
import { fetchItems, fetchTaxRates } from '@/features/items/items.api'
import { issueDebitNote } from './debit-notes.api'
import { previewDocument, type DraftLine } from '@/features/sales-invoices/gst-preview.util'

const COMPANY_STATE_CODE = '33'

export default function DebitNoteFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [originalBillId, setOriginalBillId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([])

  const { data: bills } = useQuery({
    queryKey: ['purchase-bills', 'for-debit-note'],
    queryFn: () => fetchPurchaseBills({ limit: 200 }),
  })
  const { data: allItems } = useQuery({ queryKey: ['items', 'selector'], queryFn: () => fetchItems({ limit: 200 }) })
  const { data: taxRates } = useQuery({ queryKey: ['tax-rates'], queryFn: fetchTaxRates })

  const selectedBill = bills?.items.find((b) => b._id === originalBillId)
  const isIntraState = (selectedBill?.supplierSnapshot.stateCode ?? '') === COMPANY_STATE_CODE

  useEffect(() => {
    if (selectedBill) {
      setLines(
        selectedBill.items.map((line) => ({
          itemId: line.itemId ?? '',
          quantity: line.quantity,
          rate: line.rate / 100,
        })),
      )
    } else {
      setLines([])
    }
  }, [selectedBill])

  const validLines = useMemo(() => lines.filter((l) => l.itemId && l.quantity > 0), [lines])

  const preview = useMemo(
    () => previewDocument(validLines, allItems?.items ?? [], taxRates ?? [], isIntraState),
    [validLines, allItems, taxRates, isIntraState],
  )

  const mutation = useMutation({
    mutationFn: () =>
      issueDebitNote({
        originalBillId,
        date,
        reason,
        items: validLines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, rate: l.rate })),
      }),
    onSuccess: (note) => {
      toast.success(`Debit note ${note.noteNumber} issued`)
      void queryClient.invalidateQueries({ queryKey: ['debit-notes'] })
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      void queryClient.invalidateQueries({ queryKey: ['parties'] })
      void navigate('/purchases/debit-notes')
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to issue debit note')
          : 'Failed to issue debit note'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const canSubmit = originalBillId && reason.length >= 3 && validLines.length > 0 && !mutation.isPending

  return (
    <div>
      <PageHeader
        title="New Debit Note"
        description="Issue a debit note against an original purchase bill"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/purchases/debit-notes')}>
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
          <div className="space-y-1.5">
            <Label htmlFor="originalBill">Original Bill *</Label>
            <select
              id="originalBill"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              value={originalBillId}
              onChange={(e) => setOriginalBillId(e.target.value)}
            >
              <option value="">Select bill</option>
              {bills?.items.map((bill) => (
                <option key={bill._id} value={bill._id}>
                  {bill.billNumber} — {bill.supplierSnapshot.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              required
              minLength={3}
              placeholder="e.g. Defective goods returned"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        {originalBillId && (
          <>
            <InvoiceItemTable lines={lines} previews={preview.lines} onChange={setLines} />
            <div className="flex justify-end">
              <GSTBreakdown preview={preview} />
            </div>
          </>
        )}

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background py-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchases/debit-notes')}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {mutation.isPending ? 'Issuing…' : 'Issue Debit Note'}
          </Button>
        </div>
      </form>
    </div>
  )
}
