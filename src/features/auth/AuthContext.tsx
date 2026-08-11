import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  clearAuthSession,
  getAuthSession,
  setActiveCompany as persistActiveCompany,
  setAuthSession,
  type AuthSession,
} from '@/lib/auth-storage'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  activeCompany: AuthSession['companies'][number] | null
  login: (session: AuthSession) => void
  logout: () => void
  switchCompany: (companyId: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession())

  const value = useMemo<AuthContextValue>(() => {
    const activeCompanyId = session?.activeCompanyId ?? session?.companies[0]?.companyId
    const activeCompany = session?.companies.find((c) => c.companyId === activeCompanyId) ?? null

    return {
      session,
      isAuthenticated: Boolean(session),
      activeCompany,
      login: (next) => {
        const withDefaultCompany: AuthSession = {
          ...next,
          activeCompanyId: next.companies[0]?.companyId,
        }
        setAuthSession(withDefaultCompany)
        setSession(withDefaultCompany)
      },
      logout: () => {
        clearAuthSession()
        setSession(null)
      },
      switchCompany: (companyId) => {
        persistActiveCompany(companyId)
        setSession((prev) => (prev ? { ...prev, activeCompanyId: companyId } : prev))
      },
    }
  }, [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}