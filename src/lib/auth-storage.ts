export interface CompanyMembership {
  companyId: string
  companyName: string
  companySlug: string
  roleName: string
  permissions: string[]
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  userId: string
  email: string
  name: string
  companies: CompanyMembership[]
  activeCompanyId?: string
}

const STORAGE_KEY = 'billing-suite.auth'

export function getAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function setActiveCompany(companyId: string): void {
  const session = getAuthSession()
  if (!session) return
  setAuthSession({ ...session, activeCompanyId: companyId })
}