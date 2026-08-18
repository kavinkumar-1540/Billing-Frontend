import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-2 relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 p-12 text-center">
      <div className="pointer-events-none absolute size-40 rounded-full bg-cyan-500/10 blur-3xl" />

      {Icon && (
        <div className="glass-specular glass-3 relative mb-5 flex size-20 items-center justify-center rounded-2xl border border-white/15 text-cyan-400 shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
          <Icon className="size-8" />
        </div>
      )}
      <p className="text-lg font-semibold text-slate-100">{title}</p>
      {description && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}