import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { hasPermission, permissionsLoading } = useAuth()

  if (permissionsLoading) return null
  if (!hasPermission(permission)) return <Navigate to="/" replace />

  return <>{children}</>
}
