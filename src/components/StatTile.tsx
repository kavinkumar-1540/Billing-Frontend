import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: { value: string; direction: 'up' | 'down' }
  description?: string
  tone?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'purple'
}

const TONE_CLASSES: Record<NonNullable<StatTileProps['tone']>, string> = {
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

export function StatTile({ label, value, icon: Icon, delta, description, tone = 'cyan' }: StatTileProps) {
  return (
    <Card hoverEffect className="p-4">
      <CardContent className="flex flex-col justify-between p-0">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
          <div className={cn('flex size-8 items-center justify-center rounded-xl border', TONE_CLASSES[tone])}>
            <Icon className="size-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl font-extrabold tracking-tight text-white tabular-nums">{value}</div>
          {delta && (
            <p
              className={cn(
                'mt-1 flex items-center gap-1 text-[11px] font-medium',
                delta.direction === 'up' ? 'text-emerald-400' : 'text-rose-400',
              )}
            >
              {delta.direction === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              <span>
                {delta.direction === 'up' ? '↑' : '↓'} {delta.value}
              </span>
            </p>
          )}
          {description && !delta && <p className="mt-1 text-[11px] text-slate-400">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}