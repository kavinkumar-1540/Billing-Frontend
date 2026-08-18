import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  FileSpreadsheet,
  FileCheck2,
  FileMinus2,
  Receipt,
  Undo2,
  Truck,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Package,
  SlidersHorizontal,
  Users2,
  Building2,
  Building,
  BarChart3,
  Settings,
  UserCheck,
  ShieldCheck,
  Percent,
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
          { label: 'Sales Quotation', to: '/sales/orders', icon: FileSpreadsheet },
          { label: 'Sales Invoice', to: '/sales/invoices', icon: FileText },
          { label: 'Credit Notes', to: '/sales/credit-notes', icon: Undo2 },
        ],
      },
    ],
  },
  {
    label: 'Purchases',
    sections: [
      {
        label: 'Purchases',
        icon: Truck,
        items: [
          { label: 'Purchase Quotation', to: '/purchases/orders', icon: FileCheck2 },
          { label: 'Purchase Invoice', to: '/purchases/bills', icon: Receipt },
          { label: 'Debit Notes', to: '/purchases/debit-notes', icon: FileMinus2 },
          { label: 'Bill Adjustment', to: '/purchases/bill-adjustments', icon: SlidersHorizontal },
        ],
      },
    ],
  },
  {
    label: 'Payments',
    sections: [
      {
        label: 'Payments',
        icon: Wallet,
        items: [
          { label: 'Customer Receipts', to: '/payments/receipts', icon: ArrowDownLeft },
          { label: 'Supplier Payments', to: '/payments/supplier-payments', icon: ArrowUpRight },
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
          { label: 'Items', to: '/inventory/items', icon: Package },
          { label: 'Stock Adjustment', to: '/inventory/adjustments', icon: Boxes },
        ],
      },
    ],
  },
  {
    label: 'Parties',
    sections: [
      {
        label: 'Parties',
        icon: Users2,
        items: [
          { label: 'Customers', to: '/parties/customers', icon: Users2 },
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
        items: [{ label: 'Reports & Analytics', to: '/reports', icon: BarChart3 }],
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
          { label: 'Company Profile', to: '/settings/company', icon: Building },
          { label: 'Users', to: '/settings/users', icon: UserCheck },
          { label: 'Roles & Permissions', to: '/settings/roles', icon: ShieldCheck },
          { label: 'GST / Tax', to: '/settings/tax', icon: Percent },
        ],
      },
    ],
  },
]
