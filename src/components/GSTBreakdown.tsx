import type { DocumentPreview } from '@/features/sales-invoices/gst-preview.util'

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className={bold ? '' : 'text-muted-foreground'}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function inr(value: number) {
  return `₹${value.toFixed(2)}`
}

export function GSTBreakdown({ preview }: { preview: DocumentPreview }) {
  return (
    <div className="w-full max-w-xs space-y-1.5 rounded-lg border bg-card p-4">
      <Row label="Subtotal" value={inr(preview.subtotal)} />
      {preview.totalDiscount > 0 && <Row label="Discount" value={`-${inr(preview.totalDiscount)}`} />}
      <Row label="Taxable Amount" value={inr(preview.taxableAmount)} />
      {preview.cgst > 0 && <Row label="CGST" value={inr(preview.cgst)} />}
      {preview.sgst > 0 && <Row label="SGST" value={inr(preview.sgst)} />}
      {preview.igst > 0 && <Row label="IGST" value={inr(preview.igst)} />}
      <div className="my-1 border-t" />
      <Row label="Grand Total" value={inr(preview.grandTotal)} bold />
    </div>
  )
}