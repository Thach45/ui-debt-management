import { getEffectiveAccessToken } from '@/shared/lib/auth-storage'

export type AppUserRole = 'ADMIN' | 'STAFF'

function base64UrlToJson(b64url: string): unknown | null {
  try {
    const base64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64
    const json = atob(padded)
    return JSON.parse(json) as unknown
  } catch {
    return null
  }
}

function normalizeRole(raw: unknown): AppUserRole | null {
  if (raw === 'ADMIN' || raw === 'STAFF') return raw
  if (raw && typeof raw === 'object' && 'name' in raw) {
    const n = (raw as { name?: unknown }).name
    if (n === 'ADMIN' || n === 'STAFF') return n
  }
  return null
}

/** Đọc claim `role` từ JWT (không xác thực chữ ký — chỉ dùng giao diện; API vẫn là chuẩn). */
export function getRoleFromAccessToken(): AppUserRole | null {
  const token = getEffectiveAccessToken()
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  const payload = base64UrlToJson(parts[1])
  if (!payload || typeof payload !== 'object') return null
  return normalizeRole((payload as Record<string, unknown>).role)
}

export function isAdminRole(): boolean {
  return getRoleFromAccessToken() === 'ADMIN'
}
