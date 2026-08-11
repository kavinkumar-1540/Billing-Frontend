export type StockDirection = 'IN' | 'OUT'

export type StockMovementType =
  | 'OPENING'
  | 'PURCHASE'
  | 'SALE'
  | 'SALE_RETURN'
  | 'PURCHASE_RETURN'
  | 'ADJUSTMENT'
  | 'TRANSFER'

export interface StockMovement {
  _id: string
  itemId: string
  quantity: number
  direction: StockDirection
  movementType: StockMovementType
  refDocType?: string
  refDocId?: string
  unitPrice?: number
  userId?: string
  createdAt: string
}

export interface StockAdjustmentFormValues {
  itemId: string
  direction: StockDirection
  quantity: number
  reason: string
}