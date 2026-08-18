import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { ViewPdfButton } from '@/components/ViewPdfButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchSalesInvoice, cancelSalesInvoice } from './sales-invoices.api'

export default function SalesInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['sales-invoices', id],
    queryFn: () => fetchSalesInvoice(id!),
    enabled: Boolean(id),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelSalesInvoice(id!, window.prompt('Reason for cancellation:') ?? ''),
    onSuccess: () => {
      toast.success('Invoice cancelled')
      void queryClient.invalidateQueries({ queryKey: ['sales-invoices'] })
    },
    onError: () => toast.error('Failed to cancel invoice'),
  })

  if (isLoading || !invoice) {
    return <div className="text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNumber}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/sales/invoices')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <ViewPdfButton docType="sales-invoice" id={invoice._id} title={invoice.invoiceNumber} />
            {invoice.status !== 'CANCELLED' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                Cancel Invoice
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <StatusBadge status={invoice.status} />
        <span className="text-sm text-muted-foreground">
          {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')} · {invoice.customerSnapshot.name}
        </span>
      </div>

      <Card className="mb-4">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/50 text-left text-xs text-slate-400">
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">HSN</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Rate</th>
                <th className="px-4 py-2 text-right">GST%</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((line, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-2">{line.name}</td>
                  <td className="px-4 py-2">{line.hsnSac ?? '—'}</td>
                  <td className="px-4 py-2 text-right">{line.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    <MoneyDisplay paise={line.rate} />
                  </td>
                  <td className="px-4 py-2 text-right">{line.gstRatePercent}%</td>
                  <td className="px-4 py-2 text-right font-medium">
                    <MoneyDisplay paise={line.total} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <div className="glass-2 w-full max-w-xs space-y-2.5 rounded-2xl p-5 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Taxable Amount</span>
            <MoneyDisplay paise={invoice.taxSummary.taxableAmount} />
          </div>
          {invoice.taxSummary.cgst > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>CGST</span>
              <MoneyDisplay paise={invoice.taxSummary.cgst} />
            </div>
          )}
          {invoice.taxSummary.sgst > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>SGST</span>
              <MoneyDisplay paise={invoice.taxSummary.sgst} />
            </div>
          )}
          {invoice.taxSummary.igst > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>IGST</span>
              <MoneyDisplay paise={invoice.taxSummary.igst} />
            </div>
          )}
          <div className="flex justify-between border-t border-white/15 pt-2 text-base font-extrabold text-white">
            <span>Grand Total</span>
            <span className="font-mono text-cyan-300"><MoneyDisplay paise={invoice.taxSummary.grandTotal} /></span>
          </div>
          <div className="flex justify-between text-rose-400">
            <span>Balance Due</span>
            <MoneyDisplay paise={invoice.balanceDue} />
          </div>
        </div>
      </div>
    </div>
  )
}