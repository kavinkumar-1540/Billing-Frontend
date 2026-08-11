import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { login } from './auth.api'
import { useAuth } from './AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@businesssuite.local')
  const [password, setPassword] = useState('')
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
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="size-5 text-primary" />
          </div>
          <CardTitle>Sign in to Billing Suite</CardTitle>
          <CardDescription>GST billing &amp; business management</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate({ email, password })
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {mutation.isError && (
              <p className="text-sm text-destructive">
                Invalid email or password. Please try again.
              </p>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}