export type BillAdjustmentType = 'WRITE_OFF' | 'DISCOUNT' | 'CORRECTION'

export interface BillAdjustment {
  _id: string
  purchaseBillId: {
    _id: string
    billNumber: string
    supplierSnapshot: { name: string }
  }
  adjustmentNumber: string
  date: string
  adjustmentType: BillAdjustmentType
  amount: number
  reason: string
}

export interface CreateBillAdjustmentPayload {
  purchaseBillId: string
  date: string
  adjustmentType: BillAdjustmentType
  amount: number
  reason: string
}
