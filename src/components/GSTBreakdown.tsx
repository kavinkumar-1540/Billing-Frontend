import type { DocumentPreview } from '@/features/sales-invoices/gst-preview.util'

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-xs ${bold ? 'text-sm font-extrabold text-white' : 'text-slate-300'}`}>
      <span className={bold ? 'tracking-tight' : ''}>{label}</span>
      <span className={bold ? 'font-mono text-base text-cyan-300' : 'font-mono tabular-nums'}>{value}</span>
    </div>
  )
}

function inr(value: number) {
  return `₹${value.toFixed(2)}`
}

export function GSTBreakdown({ preview }: { preview: DocumentPreview }) {
  return (
    <div className="glass-2 w-full max-w-xs space-y-2.5 rounded-2xl p-5">
      <Row label="Subtotal" value={inr(preview.subtotal)} />
      {preview.totalDiscount > 0 && <Row label="Discount" value={`-${inr(preview.totalDiscount)}`} />}
      <Row label="Taxable Amount" value={inr(preview.taxableAmount)} />
      {preview.cgst > 0 && <Row label="CGST" value={inr(preview.cgst)} />}
      {preview.sgst > 0 && <Row label="SGST" value={inr(preview.sgst)} />}
      {preview.igst > 0 && <Row label="IGST" value={inr(preview.igst)} />}
      <div className="my-2 border-t border-white/15" />
      <Row label="Grand Total" value={inr(preview.grandTotal)} bold />
    </div>
  )
}