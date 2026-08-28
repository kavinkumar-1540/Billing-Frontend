import { apiClient } from '@/lib/api-client'
import type { AuthSession } from '@/lib/auth-storage'

export interface LoginPayload {
  email: string
  password: string
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>('/auth/login', payload)
  return response.data
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword })
}