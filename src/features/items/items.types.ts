export type ItemType = 'GOODS' | 'SERVICE'

export interface TaxRate {
  _id: string
  name: string
  ratePercent: number
  cessPercent: number
  isActive: boolean
}

export interface Category {
  _id: string
  name: string
  parentCategoryId: string | null
}

export interface Item {
  _id: string
  sku: string
  name: string
  description?: string
  categoryId?: string
  brand?: string
  hsnSac?: string
  unit: string
  itemType: ItemType
  purchasePrice: number
  sellingPrice: number
  taxRateId?: string
  openingStock: number
  currentStock: number
  minStock: number
  maxStock: number
  barcode?: string
  isActive: boolean
}

export interface ItemFormValues {
  sku: string
  name: string
  description?: string
  categoryId?: string
  brand?: string
  hsnSac?: string
  unit: string
  itemType: ItemType
  purchasePrice?: number
  sellingPrice?: number
  taxRateId?: string
  openingStock?: number
  minStock?: number
  maxStock?: number
  barcode?: string
}