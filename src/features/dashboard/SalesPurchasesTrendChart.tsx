import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const data = [
  { month: 'Feb', sales: 420000, purchases: 260000 },
  { month: 'Mar', sales: 380000, purchases: 300000 },
  { month: 'Apr', sales: 510000, purchases: 340000 },
  { month: 'May', sales: 460000, purchases: 280000 },
  { month: 'Jun', sales: 590000, purchases: 360000 },
  { month: 'Jul', sales: 640000, purchases: 410000 },
]

const SERIES = {
  sales: '#06b6d4',
  purchases: '#f59e0b',
}

function formatInr(value: number) {
  return `₹${(value / 100000).toFixed(1)}L`
}

interface ChartTooltipProps {
  active?: boolean
  label?: string
  payload?: { dataKey: string; value: number }[]
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const sales = payload.find((p) => p.dataKey === 'sales')?.value
  const purchases = payload.find((p) => p.dataKey === 'purchases')?.value

  return (
    <div className="glass-3 rounded-xl border border-white/20 px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-bold text-white">{label} Performance</div>
      {sales != null && (
        <div className="flex items-center justify-between gap-3 text-cyan-300">
          <span>Sales:</span>
          <span className="font-mono font-bold">{formatInr(Number(sales))}</span>
        </div>
      )}
      {purchases != null && (
        <div className="flex items-center justify-between gap-3 text-amber-300">
          <span>Purchases:</span>
          <span className="font-mono font-bold">{formatInr(Number(purchases))}</span>
        </div>
      )}
    </div>
  )
}

export function SalesPurchasesTrendChart() {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Sales vs Purchases</CardTitle>
          <p className="mt-0.5 text-xs text-slate-400">Monthly GST transaction comparison</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: SERIES.sales, boxShadow: `0 0 8px ${SERIES.sales}` }}
            />
            Sales
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: SERIES.purchases, boxShadow: `0 0 8px ${SERIES.purchases}` }}
            />
            Purchases
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.sales} stopOpacity={0.35} />
                <stop offset="100%" stopColor={SERIES.sales} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purchasesGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.purchases} stopOpacity={0.2} />
                <stop offset="100%" stopColor={SERIES.purchases} stopOpacity={0} />
              </linearGradient>
              <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={formatInr}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="purchases"
              stroke={SERIES.purchases}
              strokeWidth={2.5}
              fill="url(#purchasesGlow)"
              dot={{ r: 3, strokeWidth: 2, stroke: 'var(--card)', fill: SERIES.purchases }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
              style={{ filter: 'url(#lineGlow)' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke={SERIES.sales}
              strokeWidth={2.5}
              fill="url(#salesGlow)"
              dot={{ r: 3, strokeWidth: 2, stroke: 'var(--card)', fill: SERIES.sales }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
              style={{ filter: 'url(#lineGlow)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
