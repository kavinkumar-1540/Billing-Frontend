import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NAV } from '@/layouts/nav-config'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CommandItem {
  id: string
  title: string
  category: string
  icon?: LucideIcon
  to: string
  badge?: string
}

const QUICK_ACTIONS: CommandItem[] = [
  { id: 'new-sales-invoice', title: 'New Sales Invoice', category: 'Actions', icon: Plus, to: '/sales/invoices/new', badge: 'Action' },
  { id: 'new-sales-order', title: 'New Sales Quotation', category: 'Actions', icon: Plus, to: '/sales/orders/new', badge: 'Action' },
  { id: 'new-purchase-bill', title: 'New Purchase Invoice', category: 'Actions', icon: Plus, to: '/purchases/bills/new', badge: 'Action' },
  { id: 'new-purchase-order', title: 'New Purchase Quotation', category: 'Actions', icon: Plus, to: '/purchases/orders/new', badge: 'Action' },
  { id: 'new-credit-note', title: 'New Credit Note', category: 'Actions', icon: Plus, to: '/sales/credit-notes/new', badge: 'Action' },
  { id: 'new-debit-note', title: 'New Debit Note', category: 'Actions', icon: Plus, to: '/purchases/debit-notes/new', badge: 'Action' },
]

const NAV_ITEMS: CommandItem[] = NAV.flatMap((group) =>
  group.sections.flatMap((section) =>
    section.items.map((item) => ({
      id: item.to,
      title: item.label,
      category: group.label || 'Navigation',
      icon: item.icon ?? section.icon,
      to: item.to,
    })),
  ),
)

const ALL_ITEMS: CommandItem[] = [...QUICK_ACTIONS, ...NAV_ITEMS]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_ITEMS
    return ALL_ITEMS.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  function select(item: CommandItem) {
    navigate(item.to)
    onOpenChange(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
      if (item) select(item)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-3 top-24 max-w-2xl translate-y-0 gap-0 overflow-hidden rounded-2xl border-white/20 p-0">
        <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900/60 px-4">
          <Search className="size-4 shrink-0 text-cyan-400" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a screen, action, or command (e.g. Sales Invoice, Customers)…"
            className="border-none bg-transparent py-4 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="max-h-96 space-y-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No matching commands or screens found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => select(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                    idx === selectedIndex
                      ? 'border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-white/10 bg-slate-800/80 p-2 text-cyan-400">
                      {Icon && <Icon className="size-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="rounded border border-cyan-400/30 bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-slate-500" />
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/60 px-4 py-2.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="mr-1 rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>
              <kbd className="mr-1 rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">↓</kbd>
              to navigate
            </span>
            <span>
              <kbd className="mr-1 rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
              to select
            </span>
          </div>
          <span>
            <kbd className="mr-1 rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">ESC</kbd>
            to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
