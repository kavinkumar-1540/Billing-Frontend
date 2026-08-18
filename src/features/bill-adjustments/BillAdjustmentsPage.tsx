import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ReceiptText } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/EmptyState'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { fetchPurchaseBills } from '@/features/purchase-bills/purchase-bills.api'
import { fetchBillAdjustments, createBillAdjustment } from './bill-adjustments.api'
import type { BillAdjustment, BillAdjustmentType } from './bill-adjustments.types'

const ADJUSTMENT_TYPES: { value: BillAdjustmentType; label: string }[] = [
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'WRITE_OFF', label: 'Write Off' },
  { value: 'CORRECTION', label: 'Correction' },
]

export default function BillAdjustmentsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [purchaseBillId, setPurchaseBillId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [adjustmentType, setAdjustmentType] = useState<BillAdjustmentType>('DISCOUNT')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['bill-adjustments'],
    queryFn: () => fetchBillAdjustments({ limit: 50 }),
  })
  const { data: bills } = useQuery({
    queryKey: ['purchase-bills', 'for-adjustment'],
    queryFn: () => fetchPurchaseBills({ limit: 200 }),
  })

  const eligibleBills = useMemo(
    () => (bills?.items ?? []).filter((b) => b.balanceDue > 0 && b.status !== 'CANCELLED'),
    [bills],
  )
  const selectedBill = eligibleBills.find((b) => b._id === purchaseBillId)

  const resetForm = () => {
    setPurchaseBillId('')
    setDate(new Date().toISOString().slice(0, 10))
    setAdjustmentType('DISCOUNT')
    setAmount('')
    setReason('')
  }

  const mutation = useMutation({
    mutationFn: () =>
      createBillAdjustment({
        purchaseBillId,
        date,
        adjustmentType,
        amount: Number(amount),
        reason,
      }),
    onSuccess: (adjustment) => {
      toast.success(`Adjustment ${adjustment.adjustmentNumber} recorded`)
      void queryClient.invalidateQueries({ queryKey: ['bill-adjustments'] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-bills'] })
      setOpen(false)
      resetForm()
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to record adjustment')
          : 'Failed to record adjustment'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const canSubmit =
    purchaseBillId &&
    reason.length >= 3 &&
    Number(amount) > 0 &&
    (!selectedBill || Number(amount) <= selectedBill.balanceDue / 100) &&
    !mutation.isPending

  const columns: DataTableColumn<BillAdjustment>[] = [
    { key: 'number', header: 'Adjustment #', render: (a) => <span className="font-medium">{a.adjustmentNumber}</span> },
    { key: 'date', header: 'Date', render: (a) => new Date(a.date).toLocaleDateString('en-IN') },
    { key: 'bill', header: 'Bill #', render: (a) => a.purchaseBillId.billNumber },
    { key: 'supplier', header: 'Supplier', render: (a) => a.purchaseBillId.supplierSnapshot.name },
    { key: 'type', header: 'Type', render: (a) => <StatusBadge status={a.adjustmentType} /> },
    { key: 'reason', header: 'Reason', render: (a) => a.reason },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (a) => <MoneyDisplay paise={a.amount} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bill Adjustment"
        description="Record a write-off, discount, or correction against a supplier's bill balance"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New Adjustment
          </Button>
        }
      />

      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No bill adjustments yet"
          description="Record an adjustment when a supplier grants a discount or a small balance needs writing off."
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              New Adjustment
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={data?.items ?? []} rowKey={(a) => a._id} isLoading={isLoading} />
      )}

      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) resetForm()
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Bill Adjustment</SheetTitle>
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
                <Label htmlFor="purchaseBill">Purchase Invoice *</Label>
                <select
                  id="purchaseBill"
                  required
                  className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                  value={purchaseBillId}
                  onChange={(e) => setPurchaseBillId(e.target.value)}
                >
                  <option value="">Select bill</option>
                  {eligibleBills.map((bill) => (
                    <option key={bill._id} value={bill._id}>
                      {bill.billNumber} — {bill.supplierSnapshot.name}
                    </option>
                  ))}
                </select>
                {selectedBill && (
                  <p className="text-xs text-muted-foreground">
                    Balance due: <MoneyDisplay paise={selectedBill.balanceDue} />
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjustmentType">Adjustment Type *</Label>
                <select
                  id="adjustmentType"
                  required
                  className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as BillAdjustmentType)}
                >
                  {ADJUSTMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  min={0.01}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  required
                  minLength={3}
                  placeholder="e.g. Supplier granted a 2% early-payment discount"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {mutation.isPending ? 'Saving…' : 'Record Adjustment'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
