import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  clearAuthSession,
  getAuthSession,
  setActiveCompany as persistActiveCompany,
  setAuthSession,
  type AuthSession,
} from '@/lib/auth-storage'
import { apiClient } from '@/lib/api-client'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  activeCompany: AuthSession['companies'][number] | null
  hasPermission: (permission: string) => boolean
  permissionsLoading: boolean
  refreshPermissions: () => void
  login: (session: AuthSession) => void
  logout: () => void
  switchCompany: (companyId: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchResolvedPermissionKeys(roleKey: string): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`/permissions/resolved/${roleKey}`)
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession())
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const requestIdRef = useRef(0)

  const activeCompanyId = session?.activeCompanyId ?? session?.companies[0]?.companyId
  const activeCompany = session?.companies.find((c) => c.companyId === activeCompanyId) ?? null

  useEffect(() => {
    if (!activeCompany) return
    const requestId = ++requestIdRef.current
    setPermissionsLoading(true)
    fetchResolvedPermissionKeys(activeCompany.roleKey)
      .then((resolvedPermissionKeys) => {
        if (requestId !== requestIdRef.current) return
        setSession((prev) => {
          if (!prev) return prev
          const next = { ...prev, resolvedPermissionKeys }
          setAuthSession(next)
          return next
        })
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setPermissionsLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompany?.roleKey, refreshNonce])

  const value = useMemo<AuthContextValue>(() => {
    const grantedKeys = new Set(session?.resolvedPermissionKeys ?? [])

    return {
      session,
      isAuthenticated: Boolean(session),
      activeCompany,
      hasPermission: (permission) => (permissionsLoading ? false : grantedKeys.has(permission)),
      permissionsLoading,
      refreshPermissions: () => setRefreshNonce((n) => n + 1),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, activeCompany, permissionsLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
