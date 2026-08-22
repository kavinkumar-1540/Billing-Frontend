import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Building2, Users2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STLogo } from '@/components/STLogo'
import { useAuth } from '@/features/auth/AuthContext'
import { NAV } from './nav-config'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { hasPermission } = useAuth()

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'glass-1 fixed inset-y-0 left-0 top-0 bottom-0 z-50 flex h-svh w-72 max-w-[85vw] flex-col border-r border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-transform duration-300 lg:sticky lg:inset-auto lg:top-3 lg:bottom-3 lg:left-3 lg:h-[calc(100svh-1.5rem)] lg:max-w-none lg:translate-x-0 lg:rounded-2xl lg:border lg:transition-[width]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-20' : 'lg:w-64',
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/8 px-4.5">
          <STLogo
            collapsed={collapsed}
            onClick={() => {
              navigate('/')
              onMobileClose?.()
            }}
          />
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
          {NAV.map((group) => (
            <div key={group.label || 'root'}>
              {group.label && !collapsed && (
                <div className="mb-1 px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {group.label}
                </div>
              )}
              <div className="space-y-3">
                {group.sections.map((section) => (
                  <div key={section.label}>
                    {section.items.length > 1 && !collapsed && section.label !== group.label && (
                      <div className="mb-1 flex items-center gap-2 px-3 text-xs font-medium text-slate-500">
                        <section.icon className="size-3.5" />
                        {section.label}
                      </div>
                    )}
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <div key={item.to} className="group relative flex items-center">
                          <NavLink
                            to={item.to}
                            end={item.to === '/'}
                            onClick={onMobileClose}
                            className={({ isActive }) =>
                              cn(
                                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
                                isActive
                                  ? 'border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                  : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100',
                              )
                            }
                          >
                            {({ isActive }) => {
                              const Icon = item.icon ?? section.icon
                              return (
                                <>
                                  <Icon className="size-4 shrink-0" />
                                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                                  {!collapsed && isActive && (
                                    <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                                  )}
                                </>
                              )
                            }}
                          </NavLink>

                          {collapsed && (
                            <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                              {item.label}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {(hasPermission('add_company') || hasPermission('manage_platform_users')) && (
            <div>
              {!collapsed && (
                <div className="mb-1 px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Platform
                </div>
              )}
              <div className="space-y-1">
                {hasPermission('add_company') && (
                  <div className="group relative flex items-center">
                    <NavLink
                      to="/companies"
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
                          isActive
                            ? 'border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Building2 className="size-4 shrink-0" />
                          {!collapsed && <span className="flex-1 truncate">Companies</span>}
                          {!collapsed && isActive && (
                            <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                          )}
                        </>
                      )}
                    </NavLink>
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                        Companies
                      </div>
                    )}
                  </div>
                )}
                {hasPermission('manage_platform_users') && (
                  <div className="group relative flex items-center">
                    <NavLink
                      to="/platform-users"
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
                          isActive
                            ? 'border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Users2 className="size-4 shrink-0" />
                          {!collapsed && <span className="flex-1 truncate">Platform Users</span>}
                          {!collapsed && isActive && (
                            <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                          )}
                        </>
                      )}
                    </NavLink>
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                        Platform Users
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden h-10 shrink-0 items-center justify-center gap-2 border-t border-white/8 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 lg:flex"
        >
          {collapsed ? <ChevronRight className="size-4" /> : (
            <>
              <ChevronLeft className="size-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </aside>
    </>
  )
}