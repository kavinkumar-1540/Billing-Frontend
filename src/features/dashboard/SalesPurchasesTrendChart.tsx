import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  sales: '#2a78d6',
  purchases: '#eb6834',
}

function formatInr(value: number) {
  return `₹${(value / 100000).toFixed(1)}L`
}

export function SalesPurchasesTrendChart() {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Sales vs Purchases</CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ background: SERIES.sales }} />
            Sales
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: SERIES.purchases }}
            />
            Purchases
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            <Tooltip
              formatter={(value) => formatInr(Number(value))}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke={SERIES.sales}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, stroke: 'var(--card)' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="purchases"
              stroke={SERIES.purchases}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, stroke: 'var(--card)' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}