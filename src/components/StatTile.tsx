import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: { value: string; direction: 'up' | 'down' }
}

export function StatTile({ label, value, icon: Icon, delta }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
          {delta && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                delta.direction === 'up' ? 'text-[#006300] dark:text-[#0ca30c]' : 'text-destructive',
              )}
            >
              {delta.direction === 'up' ? '↑' : '↓'} {delta.value}
            </p>
          )}
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4.5 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}