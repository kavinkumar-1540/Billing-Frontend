import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Receipt, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV } from './nav-config'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-svh w-64 flex-col border-r bg-card transition-transform duration-200 md:relative md:z-auto md:translate-x-0 md:transition-[width]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'md:w-16' : 'md:w-64',
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Receipt className="size-5 shrink-0 text-primary" />
          {!collapsed && <span className="truncate text-sm font-semibold">ST Billing</span>}
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
          {NAV.map((group) => (
            <div key={group.label || 'root'}>
              {group.label && !collapsed && (
                <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </div>
              )}
              <div className="space-y-3">
                {group.sections.map((section) => (
                  <div key={section.label}>
                    {section.items.length > 1 && !collapsed && (
                      <div className="mb-1 flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
                        <section.icon className="size-3.5" />
                        {section.label}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/'}
                          onClick={onMobileClose}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                              isActive
                                ? 'bg-primary/10 font-medium text-primary'
                                : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground',
                            )
                          }
                          title={collapsed ? item.label : undefined}
                        >
                          {(() => {
                            const Icon = item.icon ?? section.icon
                            return <Icon className="size-4 shrink-0" />
                          })()}
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden h-10 items-center justify-center border-t text-muted-foreground hover:bg-accent hover:text-accent-foreground md:flex"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </aside>
    </>
  )
}