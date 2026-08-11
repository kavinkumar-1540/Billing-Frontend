import { useEffect, useMemo, useState } from 'react'
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
import { PartySelector } from '@/components/PartySelector'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { fetchSalesInvoices } from '@/features/sales-invoices/sales-invoices.api'
import { fetchPurchaseBills } from '@/features/purchase-bills/purchase-bills.api'
import { recordPayment } from './payments.api'
import type { PaymentMethod, PaymentType } from './payments.types'

interface PaymentFormSheetProps {
  paymentType: PaymentType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentFormSheet({ paymentType, open, onOpenChange }: PaymentFormSheetProps) {
  const isReceipt = paymentType === 'RECEIPT'
  const partyType = isReceipt ? 'CUSTOMER' : 'SUPPLIER'
  const refDocType = isReceipt ? 'SALES_INVOICE' : 'PURCHASE_BILL'

  const [partyId, setPartyId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open) {
      setPartyId('')
      setAmount('')
      setReferenceNumber('')
      setAllocations({})
    }
  }, [open])

  const { data: invoices } = useQuery({
    queryKey: ['sales-invoices', 'outstanding', partyId],
    queryFn: () => fetchSalesInvoices({ limit: 100 }),
    enabled: isReceipt && Boolean(partyId),
  })
  const { data: bills } = useQuery({
    queryKey: ['purchase-bills', 'outstanding', partyId],
    queryFn: () => fetchPurchaseBills({ limit: 100 }),
    enabled: !isReceipt && Boolean(partyId),
  })

  const outstandingDocs = useMemo(() => {
    if (isReceipt) {
      return (invoices?.items ?? [])
        .filter((inv) => inv.customerId === partyId && inv.balanceDue > 0)
        .map((inv) => ({ id: inv._id, label: inv.invoiceNumber, balanceDue: inv.balanceDue }))
    }
    return (bills?.items ?? [])
      .filter((bill) => bill.supplierId === partyId && bill.balanceDue > 0)
      .map((bill) => ({ id: bill._id, label: bill.billNumber, balanceDue: bill.balanceDue }))
  }, [isReceipt, invoices, bills, partyId])

  const allocatedTotal = Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0)
  const amountNum = Number(amount) || 0
  const allocationMismatch = Math.abs(allocatedTotal - amountNum) > 0.001

  const mutation = useMutation({
    mutationFn: () =>
      recordPayment({
        paymentType,
        partyId,
        date,
        amount: amountNum,
        method,
        referenceNumber: referenceNumber || undefined,
        allocations: Object.entries(allocations)
          .filter(([, v]) => Number(v) > 0)
          .map(([refDocId, v]) => ({ refDocType, refDocId, amount: Number(v) })),
      }),
    onSuccess: (payment) => {
      toast.success(`${isReceipt ? 'Receipt' : 'Payment'} ${payment.paymentNumber} recorded`)
      void queryClient.invalidateQueries({ queryKey: ['payments'] })
      void queryClient.invalidateQueries({ queryKey: ['sales-invoices'] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-bills'] })
      void queryClient.invalidateQueries({ queryKey: ['parties'] })
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to record payment')
          : 'Failed to record payment'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const canSubmit = partyId && amountNum > 0 && !allocationMismatch && !mutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isReceipt ? 'Record Customer Receipt' : 'Record Supplier Payment'}</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <SheetBody className="space-y-4">
            <PartySelector
              partyType={partyType}
              label={isReceipt ? 'Customer *' : 'Supplier *'}
              value={partyId}
              onChange={setPartyId}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  min={0.01}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="method">Method *</Label>
                <select
                  id="method"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="referenceNumber">Reference #</Label>
                <Input
                  id="referenceNumber"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            </div>

            {partyId && (
              <div className="space-y-2">
                <Label>Allocate to outstanding {isReceipt ? 'invoices' : 'bills'}</Label>
                {outstandingDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No outstanding balance for this party.</p>
                ) : (
                  <div className="space-y-2 rounded-lg border p-3">
                    {outstandingDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">{doc.label}</div>
                          <div className="text-xs text-muted-foreground">
                            Due: <MoneyDisplay paise={doc.balanceDue} />
                          </div>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          className="w-28 text-right"
                          value={allocations[doc.id] ?? ''}
                          onChange={(e) =>
                            setAllocations((prev) => ({ ...prev, [doc.id]: e.target.value }))
                          }
                        />
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-2 text-sm">
                      <span className="text-muted-foreground">Allocated</span>
                      <span className={allocationMismatch ? 'font-medium text-destructive' : 'font-medium'}>
                        ₹{allocatedTotal.toFixed(2)} / ₹{amountNum.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {mutation.isPending ? 'Recording…' : 'Record Payment'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
