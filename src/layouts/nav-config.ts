import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Undo2,
  Truck,
  ReceiptText,
  RotateCcw,
  Wallet,
  Landmark,
  Boxes,
  PackageSearch,
  SlidersHorizontal,
  Users,
  Building2,
  BarChart3,
  Settings,
  UserCog,
  ShieldCheck,
  Percent,
  FileCog,
  Hash,
  CreditCard,
  Cog,
} from 'lucide-react'

export interface NavLeaf {
  label: string
  to: string
  icon?: LucideIcon
}

export interface NavSection {
  label: string
  icon: LucideIcon
  items: NavLeaf[]
}

export interface NavGroup {
  label: string
  sections: NavSection[]
}

export const NAV: NavGroup[] = [
  {
    label: '',
    sections: [
      { label: 'Dashboard', icon: LayoutDashboard, items: [{ label: 'Dashboard', to: '/' }] },
    ],
  },
  {
    label: 'Transactions',
    sections: [
      {
        label: 'Sales',
        icon: ShoppingCart,
        items: [
          { label: 'Sales Quotation', to: '/sales/orders', icon: FileText },
          { label: 'Sales Invoices', to: '/sales/invoices', icon: ReceiptText },
          { label: 'Credit Notes', to: '/sales/credit-notes', icon: Undo2 },
        ],
      },
      {
        label: 'Purchases',
        icon: Truck,
        items: [
          { label: 'Purchase Quotation', to: '/purchases/orders', icon: FileText },
          { label: 'Purchase Invoice', to: '/purchases/bills', icon: ReceiptText },
          { label: 'Debit Notes', to: '/purchases/debit-notes', icon: RotateCcw },
          { label: 'Bill Adjustment', to: '/purchases/bill-adjustments', icon: SlidersHorizontal },
        ],
      },
      {
        label: 'Payments',
        icon: Wallet,
        items: [
          { label: 'Customer Receipts', to: '/payments/receipts', icon: Landmark },
          { label: 'Supplier Payments', to: '/payments/supplier-payments', icon: Wallet },
        ],
      },
    ],
  },
  {
    label: 'Inventory',
    sections: [
      {
        label: 'Inventory',
        icon: Boxes,
        items: [
          { label: 'Items', to: '/inventory/items', icon: PackageSearch },
          { label: 'Stock Adjustments', to: '/inventory/adjustments', icon: SlidersHorizontal },
        ],
      },
    ],
  },
  {
    label: 'Parties',
    sections: [
      {
        label: 'Parties',
        icon: Users,
        items: [
          { label: 'Customers', to: '/parties/customers', icon: Users },
          { label: 'Suppliers', to: '/parties/suppliers', icon: Building2 },
        ],
      },
    ],
  },
  {
    label: 'Reports',
    sections: [
      {
        label: 'Reports',
        icon: BarChart3,
        items: [
          { label: 'Sales Reports', to: '/reports/sales', icon: BarChart3 },
          { label: 'Purchase Reports', to: '/reports/purchases', icon: BarChart3 },
          { label: 'GST Reports', to: '/reports/gst', icon: Percent },
          { label: 'Inventory Reports', to: '/reports/inventory', icon: Boxes },
          { label: 'Outstanding Reports', to: '/reports/outstanding', icon: Wallet },
          { label: 'Payment Reports', to: '/reports/payments', icon: CreditCard },
        ],
      },
    ],
  },
  {
    label: 'Settings',
    sections: [
      {
        label: 'Settings',
        icon: Settings,
        items: [
          { label: 'Company', to: '/settings/company', icon: Building2 },
          { label: 'Users', to: '/settings/users', icon: UserCog },
          { label: 'Roles & Permissions', to: '/settings/roles', icon: ShieldCheck },
          { label: 'GST / Tax', to: '/settings/tax', icon: Percent },
          { label: 'Invoice Settings', to: '/settings/invoice', icon: FileCog },
          { label: 'Numbering', to: '/settings/numbering', icon: Hash },
          { label: 'Payment Methods', to: '/settings/payment-methods', icon: CreditCard },
          { label: 'General Settings', to: '/settings/general', icon: Cog },
        ],
      },
    ],
  },
]