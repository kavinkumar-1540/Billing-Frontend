import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IndianRupee,
  ShoppingBag,
  Wallet,
  Building,
  FileText,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  UserPlus,
  Building2,
  Boxes,
  Users2,
  ArrowDownLeft,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatTile } from '@/components/StatTile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { fetchParties } from '@/features/parties/parties.api'
import { fetchSalesInvoices } from '@/features/sales-invoices/sales-invoices.api'
import type { SalesInvoice } from '@/features/sales-invoices/sales-invoices.types'
import { SalesPurchasesTrendChart } from './SalesPurchasesTrendChart'

const DATE_FILTERS = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'] as const

const QUICK_ACTIONS = [
  { label: 'New Sales Invoice', icon: FileText, to: '/sales/invoices/new', tone: 'cyan' as const },
  { label: 'New Sales Order / Quotation', icon: FileSpreadsheet, to: '/sales/orders', tone: 'blue' as const },
  { label: 'New Purchase Bill', icon: Receipt, to: '/purchases/bills/new', tone: 'purple' as const },
  { label: 'New Purchase Order', icon: FileCheck2, to: '/purchases/orders', tone: 'purple' as const },
  { label: 'Add Customer', icon: UserPlus, to: '/parties/customers', tone: 'emerald' as const },
  { label: 'Add Supplier', icon: Building2, to: '/parties/suppliers', tone: 'amber' as const },
  { label: 'Record Payment Receipt', icon: ArrowDownLeft, to: '/payments/receipts', tone: 'cyan' as const },
]

const TONE_ICON_BG: Record<string, string> = {
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const invoiceColumns: DataTableColumn<SalesInvoice>[] = [
  {
    key: 'invoiceNumber',
    header: 'Invoice #',
    render: (row) => <span className="font-mono font-semibold text-cyan-300">{row.invoiceNumber}</span>,
  },
  { key: 'customer', header: 'Customer', render: (row) => row.customerSnapshot.name },
  { key: 'date', header: 'Date', render: (row) => new Date(row.invoiceDate).toLocaleDateString('en-IN') },
  {
    key: 'taxable',
    header: 'Taxable',
    align: 'right',
    render: (row) => <MoneyDisplay paise={row.taxSummary.taxableAmount} />,
  },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    render: (row) => <span className="font-bold text-white"><MoneyDisplay paise={row.taxSummary.grandTotal} /></span>,
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  {
    key: 'action',
    header: '',
    align: 'right',
    render: (row) => (
      <Link
        to={`/sales/invoices/${row._id}`}
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-cyan-400 hover:text-cyan-300"
      >
        View
      </Link>
    ),
  },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<(typeof DATE_FILTERS)[number]>('This Month')
  const navigate = useNavigate()

  const { data: customers } = useQuery({
    queryKey: ['parties', 'CUSTOMER', 'count'],
    queryFn: () => fetchParties('CUSTOMER', { limit: 1 }),
  })

  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['sales-invoices', 'recent'],
    queryFn: () => fetchSalesInvoices({ page: 1, limit: 4 }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Dashboard" description="Overview of sales, purchases, and outstanding balances" />
        <div className="glass-2 flex items-center gap-1 self-start rounded-xl border border-white/10 p-1 sm:self-auto">
          {DATE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTimeRange(f)}
              className={
                timeRange === f
                  ? 'whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1.5 text-xs font-medium text-white shadow-md'
                  : 'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200'
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatTile label="Total Sales (MTD)" value="₹5,90,000" icon={IndianRupee} tone="cyan" delta={{ value: '12.4% vs last month', direction: 'up' }} />
        <StatTile label="Total Purchases (MTD)" value="₹4,10,000" icon={ShoppingBag} tone="blue" delta={{ value: '5.1% vs last month', direction: 'up' }} />
        <StatTile label="Receivables" value="₹2,35,400" icon={Building} tone="emerald" description="Pending from customers" />
        <StatTile label="Payables" value="₹1,82,900" icon={Wallet} tone="amber" description="Due to suppliers" />
        <StatTile label="Stock Value" value="₹8,40,200" icon={Boxes} tone="purple" description="Across all items" />
        <StatTile label="Customer Count" value={customers ? String(customers.total) : '—'} icon={Users2} tone="cyan" description="Active customers" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesPurchasesTrendChart />
        </div>
        <Card className="p-6">
          <CardContent className="p-0">
            <h3 className="mb-1 text-base font-semibold text-white">Quick actions</h3>
            <p className="mb-4 text-xs text-slate-400">Frequently accessed business workflows</p>
            <div className="space-y-2.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="glass-2-hover glass-1 group flex w-full items-center justify-between rounded-xl border border-white/10 p-3 text-left text-xs font-medium text-slate-200 transition-all hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex size-8 items-center justify-center rounded-lg border ${TONE_ICON_BG[action.tone]}`}>
                      <action.icon className="size-4" />
                    </div>
                    <span>{action.label}</span>
                  </div>
                  <ArrowRight className="size-3.5 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="flex-row items-center justify-between space-y-0 p-0 pb-4">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="mt-0.5 text-xs text-slate-400">Latest sales invoices and customer records</p>
          </div>
          <Button variant="ghost" size="sm" className="text-cyan-300 hover:text-cyan-200" onClick={() => navigate('/sales/invoices')}>
            View All Invoices
            <ArrowRight className="size-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={invoiceColumns}
            data={recentInvoices?.items ?? []}
            rowKey={(row) => row._id}
            isLoading={invoicesLoading}
            emptyTitle="No recent transactions found"
            onRowClick={(row) => navigate(`/sales/invoices/${row._id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}