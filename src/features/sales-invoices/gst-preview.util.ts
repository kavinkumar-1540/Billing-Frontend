import type { Item } from '@/features/items/items.types'
import type { TaxRate } from '@/features/items/items.types'

export interface DraftLine {
  itemId: string
  quantity: number
  rate: number // rupees
  discountPercent?: number
}

export interface LinePreview {
  taxableValue: number
  cgst: number
  sgst: number
  igst: number
  total: number
  gstRatePercent: number
}

export interface DocumentPreview {
  lines: LinePreview[]
  subtotal: number
  totalDiscount: number
  taxableAmount: number
  cgst: number
  sgst: number
  igst: number
  grandTotal: number
}

/**
 * Client-side mirror of the backend TaxCalculationService, used only for
 * live preview while editing. The backend always recalculates authoritatively
 * on submit — this never determines what gets persisted.
 */
export function previewDocument(
  lines: DraftLine[],
  items: Item[],
  taxRates: TaxRate[],
  isIntraState: boolean,
): DocumentPreview {
  const itemsById = new Map(items.map((i) => [i._id, i]))
  const taxRatesById = new Map(taxRates.map((t) => [t._id, t]))

  const linePreviews: LinePreview[] = lines.map((line) => {
    const item = itemsById.get(line.itemId)
    const taxRate = item?.taxRateId ? taxRatesById.get(item.taxRateId) : undefined
    const gstRatePercent = taxRate?.ratePercent ?? 0

    const gross = line.quantity * line.rate
    const discount = line.discountPercent ? (gross * line.discountPercent) / 100 : 0
    const taxableValue = Math.max(0, gross - discount)
    const gstAmount = (taxableValue * gstRatePercent) / 100

    const cgst = isIntraState ? gstAmount / 2 : 0
    const sgst = isIntraState ? gstAmount / 2 : 0
    const igst = isIntraState ? 0 : gstAmount

    return {
      taxableValue,
      cgst,
      sgst,
      igst,
      total: taxableValue + cgst + sgst + igst,
      gstRatePercent,
    }
  })

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.rate, 0)
  const taxableAmount = linePreviews.reduce((sum, l) => sum + l.taxableValue, 0)
  const totalDiscount = subtotal - taxableAmount
  const cgst = linePreviews.reduce((sum, l) => sum + l.cgst, 0)
  const sgst = linePreviews.reduce((sum, l) => sum + l.sgst, 0)
  const igst = linePreviews.reduce((sum, l) => sum + l.igst, 0)
  const grandTotal = Math.round(taxableAmount + cgst + sgst + igst)

  return { lines: linePreviews, subtotal, totalDiscount, taxableAmount, cgst, sgst, igst, grandTotal }
}