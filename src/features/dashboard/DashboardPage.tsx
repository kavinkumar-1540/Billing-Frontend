import {
  IndianRupee,
  ShoppingBag,
  Wallet,
  Landmark,
  FileText,
  ReceiptText,
  Truck,
  Users,
  Building2,
  Package,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatTile } from '@/components/StatTile'
import { Button } from '@/components/ui/button'
import { SalesPurchasesTrendChart } from './SalesPurchasesTrendChart'

const DATE_FILTERS = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year']

const QUICK_ACTIONS = [
  { label: 'New Sales Invoice', icon: ReceiptText },
  { label: 'New Sales Order', icon: FileText },
  { label: 'New Purchase Bill', icon: Truck },
  { label: 'New Purchase Order', icon: Package },
  { label: 'Add Customer', icon: Users },
  { label: 'Add Supplier', icon: Building2 },
  { label: 'Record Payment', icon: Wallet },
]

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of sales, purchases, and outstanding balances"
        actions={
          <div className="flex items-center gap-1 rounded-md border bg-background p-1">
            {DATE_FILTERS.map((f, i) => (
              <button
                key={f}
                type="button"
                className={
                  i === 2
                    ? 'rounded px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground'
                    : 'rounded px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent'
                }
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Sales (MTD)" value="₹5,90,000" icon={IndianRupee} delta={{ value: '12.4% vs last month', direction: 'up' }} />
        <StatTile label="Total Purchases (MTD)" value="₹4,10,000" icon={ShoppingBag} delta={{ value: '5.1% vs last month', direction: 'up' }} />
        <StatTile label="Receivables" value="₹2,35,400" icon={Landmark} />
        <StatTile label="Payables" value="₹1,82,900" icon={Wallet} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Outstanding Invoices" value="14" icon={ReceiptText} />
        <StatTile label="Outstanding Purchase Bills" value="6" icon={Truck} />
        <StatTile label="Stock Value" value="₹8,40,200" icon={Package} />
        <StatTile label="Low Stock Items" value="3" icon={Package} delta={{ value: 'needs attention', direction: 'down' }} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SalesPurchasesTrendChart />
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Quick actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button key={action.label} variant="outline" size="sm" className="justify-start gap-2">
                <action.icon className="size-4" />
                <span className="truncate text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}