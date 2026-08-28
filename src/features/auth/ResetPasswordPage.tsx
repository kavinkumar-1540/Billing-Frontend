import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { STLogo } from '@/components/STLogo'
import { AmbientBackground } from '@/components/AmbientBackground'
import { resetPassword } from './auth.api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mismatchError, setMismatchError] = useState(false)

  const mutation = useMutation({
    mutationFn: () => resetPassword(token, newPassword),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMismatchError(true)
      return
    }
    setMismatchError(false)
    mutation.mutate()
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#070b14] p-4 sm:p-6">
      <AmbientBackground />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/90" />

      <div className="glass-specular glass-3 relative z-10 w-full max-w-sm overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="flex justify-center pb-5 pt-1">
          <STLogo size="lg" layout="vertical" />
        </div>

        {!token ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs text-rose-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>This reset link is missing its token. Please request a new one from the login page.</span>
          </div>
        ) : mutation.isSuccess ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Password updated. You can now sign in with your new password.</span>
            </div>
            <Button type="button" className="w-full" onClick={() => navigate('/login', { replace: true })}>
              Go to Login
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="mb-2 text-center">
              <h2 className="text-base font-bold text-white">Set a new password</h2>
              <p className="mt-0.5 text-xs text-slate-400">Choose a new password for your account</p>
            </div>

            {mutation.isError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>This reset link is invalid or has expired. Please request a new one.</span>
              </div>
            )}
            {mismatchError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>Passwords do not match.</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <Label htmlFor="newPassword" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-10 font-mono"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="space-y-1.5 text-left">
              <Label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                className="font-mono"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>

            <p className="text-center text-xs text-slate-500">
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
