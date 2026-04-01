import axios from 'axios'

import type { ResponseApi } from '@/shared/types/api'
import { clearAuthTokens, getEffectiveAccessToken } from '@/shared/lib/auth-storage'

function resolveAuthToken(): string | undefined {
  return getEffectiveAccessToken()
}

/** baseURL rỗng = cùng origin (Vite proxy `/api` → backend) */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = resolveAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const reqUrl = error.config?.url ?? ''
      const isLoginRequest = reqUrl.includes('/auth/login')
      if (status === 401 && !isLoginRequest) {
        clearAuthTokens()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login')
        }
      }
      const msg =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message
      return Promise.reject(new Error(msg))
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  },
)

export function unwrapResponseApi<T>(body: ResponseApi<T>): T {
  if (!body.success) {
    throw new Error(body.message || 'Lỗi API')
  }
  return body.data
}
