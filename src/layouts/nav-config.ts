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
  /** Permission key required to see/access this item. Omit for always-visible items (e.g. Dashboard). */
  permission?: string
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
          { label: 'Sales Quotation', to: '/sales/orders', icon: FileSpreadsheet, permission: 'sales:view' },
          { label: 'Sales Invoice', to: '/sales/invoices', icon: FileText, permission: 'sales:view' },
          { label: 'Credit Notes', to: '/sales/credit-notes', icon: Undo2, permission: 'sales:view' },
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
          { label: 'Purchase Quotation', to: '/purchases/orders', icon: FileCheck2, permission: 'purchase:view' },
          { label: 'Purchase Invoice', to: '/purchases/bills', icon: Receipt, permission: 'purchase:view' },
          { label: 'Debit Notes', to: '/purchases/debit-notes', icon: FileMinus2, permission: 'purchase:view' },
          {
            label: 'Bill Adjustment',
            to: '/purchases/bill-adjustments',
            icon: SlidersHorizontal,
            permission: 'purchase:view',
          },
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
          { label: 'Customer Receipts', to: '/payments/receipts', icon: ArrowDownLeft, permission: 'payments:view' },
          {
            label: 'Supplier Payments',
            to: '/payments/supplier-payments',
            icon: ArrowUpRight,
            permission: 'payments:view',
          },
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
          { label: 'Items', to: '/inventory/items', icon: Package, permission: 'inventory:view' },
          { label: 'Stock Adjustment', to: '/inventory/adjustments', icon: Boxes, permission: 'inventory:view' },
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
          { label: 'Customers', to: '/parties/customers', icon: Users2, permission: 'parties:manage' },
          { label: 'Suppliers', to: '/parties/suppliers', icon: Building2, permission: 'parties:manage' },
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
        items: [{ label: 'Reports & Analytics', to: '/reports', icon: BarChart3, permission: 'reports:view' }],
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
          { label: 'Company Profile', to: '/settings/company', icon: Building, permission: 'settings:manage' },
          { label: 'Users', to: '/settings/users', icon: UserCheck, permission: 'users:manage' },
          { label: 'Roles & Permissions', to: '/settings/roles', icon: ShieldCheck, permission: 'users:manage' },
          { label: 'GST / Tax', to: '/settings/tax', icon: Percent, permission: 'settings:manage' },
        ],
      },
    ],
  },
]
