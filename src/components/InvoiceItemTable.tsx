import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ItemSelector } from '@/components/ItemSelector'
import type { DraftLine, LinePreview } from '@/features/sales-invoices/gst-preview.util'

interface InvoiceItemTableProps {
  lines: DraftLine[]
  previews: LinePreview[]
  onChange: (lines: DraftLine[]) => void
}

const emptyLine: DraftLine = { itemId: '', quantity: 1, rate: 0 }

export function InvoiceItemTable({ lines, previews, onChange }: InvoiceItemTableProps) {
  function updateLine(index: number, patch: Partial<DraftLine>) {
    onChange(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs font-medium text-muted-foreground">
            <th className="px-3 py-2">Item</th>
            <th className="w-20 px-3 py-2 text-right">Qty</th>
            <th className="w-28 px-3 py-2 text-right">Rate (₹)</th>
            <th className="w-24 px-3 py-2 text-right">Disc %</th>
            <th className="w-20 px-3 py-2 text-right">GST %</th>
            <th className="w-28 px-3 py-2 text-right">Taxable</th>
            <th className="w-28 px-3 py-2 text-right">Total</th>
            <th className="w-10 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => {
            const preview = previews[i]
            return (
              <tr key={i} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <ItemSelector value={line.itemId} onChange={(itemId) => updateLine(i, { itemId })} />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={0.01}
                    step="any"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                    className="text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={line.rate}
                    onChange={(e) => updateLine(i, { rate: Number(e.target.value) })}
                    className="text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={line.discountPercent ?? ''}
                    onChange={(e) => updateLine(i, { discountPercent: Number(e.target.value) })}
                    className="text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {preview?.gstRatePercent ?? 0}%
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  ₹{(preview?.taxableValue ?? 0).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-medium tabular-nums">
                  ₹{(preview?.total ?? 0).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLine(i)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="border-t p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => onChange([...lines, { ...emptyLine }])}
        >
          <Plus className="size-4" />
          Add Item
        </Button>
      </div>
    </div>
  )
}