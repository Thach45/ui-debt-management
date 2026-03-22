import axios from 'axios'

import type { ResponseApi } from '@/shared/types/api'

function resolveAuthToken(): string | undefined {
  const fromStorage = localStorage.getItem('accessToken')
  if (fromStorage) return fromStorage
  const fromEnv = import.meta.env.VITE_AUTH_TOKEN
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv
  return undefined
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
