import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Receipt, Zap, FileText, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from './auth.api'
import { useAuth } from './AuthContext'
import { LoginHeroBackground } from './LoginHeroBackground'

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: 'Real-time GST Calculations',
    description: 'CGST, SGST & IGST computed instantly on every line',
  },
  {
    icon: FileText,
    title: 'Sales, Purchases & Inventory',
    description: 'Orders, invoices, bills and stock in one place',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based Access',
    description: 'Fine-grained permissions across every module',
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState('admin@businesssuite.local')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login: setSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session)
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
      void navigate(redirectTo, { replace: true })
    },
  })

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#0a1330] px-4 py-12 lg:justify-end lg:px-24">
      <LoginHeroBackground />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#0a1330]/10 via-transparent to-[#0a1330]/40 lg:block" />

      <div className="relative z-10 hidden max-w-md text-primary-foreground lg:absolute lg:left-24 lg:top-1/2 lg:block lg:-translate-y-1/2">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <Receipt className="size-5" />
          </div>
          <span className="text-lg font-semibold">ST Billing</span>
        </div>

        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          GST Billing, <span className="opacity-80">Simplified</span>
        </h1>
        <p className="mt-4 text-sm text-primary-foreground/80">
          Sales, purchases, inventory and payments — with automated GST compliance built in
          from day one.
        </p>

        <div className="mt-10 space-y-5">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-white/15">
                <item.icon className="size-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-sm text-primary-foreground/70">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1a3d]/90 p-8 shadow-2xl backdrop-blur-sm lg:bg-[#0f1a3d]/95">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
            <Receipt className="size-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">ST Billing</span>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-white">Sign in with your account</h2>
          <p className="mt-1 text-sm text-white/60">Enter your credentials to access your workspace</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate({ email, password })
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/80">
                Password
              </Label>
              <button
                type="button"
                className="text-xs font-medium text-primary-foreground/80 hover:text-primary-foreground hover:underline"
                onClick={() => alert('Contact your administrator to reset your password.')}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="border-white/15 bg-white/5 pr-10 text-white placeholder:text-white/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-white/50 hover:text-white"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-400">Invalid email or password. Please try again.</p>
          )}
          <Button type="submit" className="w-full gap-1.5" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-white/40">ST Billing</p>
      </div>
    </div>
  )
}
