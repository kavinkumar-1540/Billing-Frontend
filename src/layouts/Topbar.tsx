import { useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, Laptop, LogOut, ChevronsUpDown, Plus, Menu } from 'lucide-react'
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

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobileNav}>
        <Menu className="size-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="max-w-40 justify-between sm:max-w-56">
            <span className="truncate">{activeCompany?.companyName ?? 'Select company'}</span>
            <ChevronsUpDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Companies</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {session?.companies.map((c) => (
            <DropdownMenuItem key={c.companyId} onClick={() => switchCompany(c.companyId)}>
              {c.companyName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden h-9 flex-1 max-w-md items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground hover:bg-muted sm:flex"
      >
        <Search className="size-4" />
        <span>Search invoices, customers, items…</span>
        <kbd className="ml-auto rounded border bg-background px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <Button variant="ghost" size="icon" className="sm:hidden" onClick={onOpenSearch}>
        <Search className="size-4" />
      </Button>

      <div className="flex-1" />

      <Button
        variant="default"
        size="sm"
        className="hidden gap-1.5 sm:inline-flex"
        onClick={() => navigate('/sales/invoices/new')}
      >
        <Plus className="size-4" />
        New Invoice
      </Button>
      <Button
        variant="default"
        size="icon"
        className="sm:hidden"
        onClick={() => navigate('/sales/invoices/new')}
      >
        <Plus className="size-4" />
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
          <button type="button" className="rounded-full">
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
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="size-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}