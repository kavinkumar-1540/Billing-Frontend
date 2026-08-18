import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Sun,
  Moon,
  Laptop,
  LogOut,
  ChevronDown,
  Check,
  Plus,
  Menu,
  Maximize2,
  Minimize2,
  Building,
  User,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/AuthContext'
import { useTheme } from '@/components/theme-provider'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Topbar({
  onOpenSearch,
  onOpenMobileNav,
}: {
  onOpenSearch: () => void
  onOpenMobileNav: () => void
}) {
  const { session, activeCompany, switchCompany, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [isFullscreen, setIsFullscreen] = useState(false)

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-white/10 bg-slate-950/85 px-3 shadow-[0_4px_25px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:gap-3 sm:px-4">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav}>
        <Menu className="size-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="max-w-40 justify-between gap-2 sm:max-w-56">
            <span className="flex items-center gap-2 truncate">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/20 text-cyan-300">
                <Building className="size-3" />
              </span>
              <span className="truncate">{activeCompany?.companyName ?? 'Select company'}</span>
            </span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Active Enterprise</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {session?.companies.map((c) => (
            <DropdownMenuItem
              key={c.companyId}
              onClick={() => switchCompany(c.companyId)}
              className={c.companyId === activeCompany?.companyId ? 'bg-cyan-500/15 text-cyan-200' : undefined}
            >
              <Building className="size-4 shrink-0 text-cyan-400" />
              <span className="flex-1 truncate">{c.companyName}</span>
              {c.companyId === activeCompany?.companyId && <Check className="size-3.5 shrink-0 text-cyan-400" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings/company')}>
            <Building className="size-4" /> Configure Company Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden h-9 flex-1 max-w-md items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 text-sm text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 sm:flex"
      >
        <Search className="size-4" />
        <span>Search invoices, customers, items…</span>
        <kbd className="ml-auto rounded bg-slate-800 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
      </button>

      <Button variant="ghost" size="icon" className="sm:hidden" onClick={onOpenSearch}>
        <Search className="size-4" />
      </Button>

      <div className="flex-1" />

      <Button
        variant="default"
        size="sm"
        className="hidden gap-1.5 shadow-[0_4px_16px_rgba(6,182,212,0.35)] sm:inline-flex"
        onClick={() => navigate('/sales/invoices/new')}
      >
        <Plus className="size-4" />
        New Invoice
      </Button>
      <Button
        variant="default"
        size="icon"
        className="shadow-[0_4px_16px_rgba(6,182,212,0.35)] sm:hidden"
        onClick={() => navigate('/sales/invoices/new')}
      >
        <Plus className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden sm:inline-flex"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Display Mode'}
      >
        {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            {theme === 'dark' ? (
              <Moon className="size-4" />
            ) : theme === 'light' ? (
              <Sun className="size-4" />
            ) : (
              <Laptop className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun className="size-4" /> Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon className="size-4" /> Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Laptop className="size-4" /> System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="rounded-full transition-transform hover:scale-105">
            <Avatar>
              <AvatarFallback>{session ? initials(session.name) : '?'}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="truncate">{session?.name}</div>
            <div className="truncate text-xs font-normal text-muted-foreground">
              {session?.email}
            </div>
            {activeCompany?.roleName && (
              <div className="mt-1.5 inline-flex items-center rounded border border-cyan-500/30 bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300">
                {activeCompany.roleName}
              </div>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings/company')}>
            <Building className="size-4" /> Company Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings/users')}>
            <User className="size-4" /> Users &amp; Team
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings/roles')}>
            <Shield className="size-4" /> Roles &amp; Permissions
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="font-medium text-rose-400 hover:!bg-rose-500/10 hover:!text-rose-300">
            <LogOut className="size-4 text-rose-400" /> Sign Out / Switch Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}