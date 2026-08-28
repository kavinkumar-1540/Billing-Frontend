import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Zap, MessageSquare, Lock, Eye, EyeOff, Sparkles, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { STLogo } from '@/components/STLogo'
import { login, forgotPassword } from './auth.api'
import { useAuth } from './AuthContext'
import { LoginHeroBackground } from './LoginHeroBackground'
import { AmbientBackground } from '@/components/AmbientBackground'
import { LoginAiAssistant } from './LoginAiAssistant'

const HIGHLIGHTS = [
  {
    icon: Zap,
    tone: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
    title: 'Real-time GST Insights',
    description: 'Auto-tax calculation, HSN lookup & instant GST slab breakdown.',
  },
  {
    icon: MessageSquare,
    tone: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300',
    title: 'Omnichannel Invoicing',
    description: 'E-Way generation, thermal & A4 print, email and WhatsApp share.',
  },
  {
    icon: Lock,
    tone: 'bg-purple-500/20 border-purple-400/30 text-purple-300',
    title: 'Enterprise Security',
    description: 'Role-based access matrix for Admin, Billing, Inventory & Audit.',
  },
]

const DEMO_LOGINS = [
  { email: 'admin@zentra.local', name: 'Administrator', subtitle: 'Full Access', initials: 'AU', tone: 'cyan' as const },
  { email: 'staff@zentra.local', name: 'Staff', subtitle: 'Day-to-day Operations', initials: 'SU', tone: 'blue' as const },
  { email: 'superadmin@zentra.local', name: 'Super Admin', subtitle: 'Platform / Create Companies', initials: 'SA', tone: 'amber' as const },
]

const DEMO_LOGIN_TONE: Record<(typeof DEMO_LOGINS)[number]['tone'], string> = {
  cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 group-hover:text-cyan-200 hover:border-cyan-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30 group-hover:text-blue-200 hover:border-blue-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30 group-hover:text-amber-200 hover:border-amber-500/30',
}

const DEMO_PASSWORD = 'ChangeMe@123'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@zentra.local')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
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

  function handleDemoLogin(demoEmail: string) {
    mutation.mutate({ email: demoEmail, password: DEMO_PASSWORD })
  }

  const forgotPasswordMutation = useMutation({
    mutationFn: (targetEmail: string) => forgotPassword(targetEmail),
    onSuccess: () => setResetSent(true),
  })

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#070b14] p-4 sm:p-6 lg:p-12">
      <AmbientBackground />
      <LoginHeroBackground />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/90" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col justify-center space-y-8 lg:col-span-7 lg:pr-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md">
              <Sparkles className="size-3.5 text-cyan-400" />
              <span>Next-Gen GST Billing &amp; ERP Suite</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Intelligent{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                GST Billing &amp; ERP
              </span>{' '}
              Platform
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-300/90 sm:text-base">
              Smart billing. Simplified business. Real-time GST compliance, seamless invoicing,
              multi-tier inventory management, and automated financial ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 shadow-lg transition-all hover:border-cyan-500/30 hover:bg-slate-900/80"
              >
                <div className={`mb-2.5 flex size-8 items-center justify-center rounded-xl border ${item.tone}`}>
                  <item.icon className="size-4" />
                </div>
                <h4 className="mb-1 text-xs font-bold text-white">{item.title}</h4>
                <p className="text-[11px] leading-snug text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>

          <LoginAiAssistant />
        </div>

        <div className="flex justify-center lg:col-span-5">
          <div className="glass-specular glass-3 relative w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="flex justify-center pb-5 pt-1">
              <STLogo size="lg" layout="vertical" />
            </div>

            <div className="mb-6 text-center">
              <h2 className="text-base font-bold text-white">Sign in with your account</h2>
              <p className="mt-0.5 text-xs text-slate-400">Access your organization dashboard &amp; GST reports</p>
            </div>

            {mutation.isError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>Invalid email or password. Please try again.</span>
              </div>
            )}

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate({ email, password })
              }}
            >
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@zentra.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                    onClick={() => setShowForgotModal(true)}
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
                    className="pr-10 font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex select-none items-center gap-2 text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_6px_28px_rgba(6,182,212,0.6)]"
                disabled={mutation.isPending}
              >
                <LogIn className="size-4" />
                {mutation.isPending ? 'Authenticating...' : 'Sign in'}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span className="bg-[#0f172a] px-3">Or Demo 1-Click Sign In</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_LOGINS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleDemoLogin(demo.email)}
                  disabled={mutation.isPending}
                  className={`group flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-2 text-left transition-colors disabled:opacity-50 ${demo.tone === 'amber' ? 'col-span-2' : ''} ${DEMO_LOGIN_TONE[demo.tone]}`}
                >
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold ${DEMO_LOGIN_TONE[demo.tone]}`}
                  >
                    {demo.initials}
                  </div>
                  <div className="truncate">
                    <div className="truncate text-[11px] font-bold text-white">{demo.name}</div>
                    <div className="truncate text-[9px] text-slate-400">{demo.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5 text-[11px] text-slate-500">
              <span>GST Compliance Engine</span>
              <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showForgotModal} onOpenChange={(open) => {
        setShowForgotModal(open)
        if (!open) setResetSent(false)
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <p className="text-xs text-slate-400">
              Enter your registered email address to receive password recovery instructions.
            </p>

            {resetSent ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Password reset link sent to {forgotEmail || email}.</span>
              </div>
            ) : (
              <Input
                type="email"
                value={forgotEmail || email}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@company.com"
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForgotModal(false)}>
                Close
              </Button>
              {!resetSent && (
                <Button
                  type="button"
                  size="sm"
                  disabled={forgotPasswordMutation.isPending}
                  onClick={() => forgotPasswordMutation.mutate(forgotEmail || email)}
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
