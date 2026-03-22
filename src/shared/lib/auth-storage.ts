/** Khóa trùng với logic Bearer trong `api/client.ts` */
const KEY_ACCESS = 'accessToken'
const KEY_REFRESH = 'refreshToken'

export function getEffectiveAccessToken(): string | undefined {
  const fromStorage = localStorage.getItem(KEY_ACCESS)
  if (fromStorage) return fromStorage
  const fromEnv = import.meta.env.VITE_AUTH_TOKEN
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv
  return undefined
}

export function isAuthenticated(): boolean {
  return Boolean(getEffectiveAccessToken())
}

export function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(KEY_ACCESS, accessToken)
  localStorage.setItem(KEY_REFRESH, refreshToken)
}

export function clearAuthTokens() {
  localStorage.removeItem(KEY_ACCESS)
  localStorage.removeItem(KEY_REFRESH)
}
