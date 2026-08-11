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