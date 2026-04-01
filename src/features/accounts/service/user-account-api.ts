import { apiClient, unwrapResponseApi } from '@/shared/api/client'
import type { ResponseApi } from '@/shared/types/api'

import type { RegisterUserPayload, UpdateUserPayload, UserAccountDto } from '@/features/accounts/types'

export async function fetchUsers(): Promise<UserAccountDto[]> {
  const res = await apiClient.get<ResponseApi<UserAccountDto[]>>('/api/v1/users')
  return unwrapResponseApi(res.data)
}

export async function registerUser(payload: RegisterUserPayload): Promise<UserAccountDto> {
  const res = await apiClient.post<ResponseApi<UserAccountDto>>('/api/v1/auth/register', payload)
  return unwrapResponseApi(res.data)
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserAccountDto> {
  const res = await apiClient.put<ResponseApi<UserAccountDto>>(`/api/v1/auth/${id}`, payload)
  return unwrapResponseApi(res.data)
}

export async function deleteUser(id: string): Promise<void> {
  const res = await apiClient.delete<ResponseApi<null>>(`/api/v1/users/${id}`)
  unwrapResponseApi(res.data)
}
