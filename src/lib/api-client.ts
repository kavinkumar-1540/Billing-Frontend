import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAuthSession, setAuthSession, clearAuthSession } from './auth-storage'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const session = getAuthSession()
  if (session?.accessToken) {
    config.headers.set('Authorization', `Bearer ${session.accessToken}`)
  }
  if (session?.activeCompanyId) {
    config.headers.set('x-company-id', session.activeCompanyId)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const session = getAuthSession()
  if (!session?.refreshToken) return null

  try {
    const response = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${apiClient.defaults.baseURL}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${session.refreshToken}` } },
    )
    const updated = { ...session, ...response.data }
    setAuthSession(updated)
    return updated.accessToken
  } catch {
    clearAuthSession()
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      refreshPromise ??= refreshAccessToken()
      const newAccessToken = await refreshPromise
      refreshPromise = null

      if (newAccessToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
        return apiClient(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)