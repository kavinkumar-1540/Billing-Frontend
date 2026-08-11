import { Badge, type badgeVariants } from '@/components/ui/badge'
import type { VariantProps } from 'class-variance-authority'

type Variant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const STATUS_VARIANT: Record<string, Variant> = {
  DRAFT: 'secondary',
  ACTIVE: 'success',
  ISSUED: 'default',
  CONFIRMED: 'default',
  SENT: 'default',
  PARTIALLY_PAID: 'warning',
  PARTIALLY_INVOICED: 'warning',
  PARTIALLY_RECEIVED: 'warning',
  PAID: 'success',
  RECEIVED: 'success',
  INVOICED: 'success',
  COMPLETED: 'success',
  OVERDUE: 'destructive',
  CANCELLED: 'destructive',
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_VARIANT[status] ?? 'outline'}>{toTitleCase(status)}</Badge>
}