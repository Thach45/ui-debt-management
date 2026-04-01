import { apiClient, unwrapResponseApi } from '@/shared/api/client'
import type { ResponseApi } from '@/shared/types/api'

export type LoginBody = {
  email: string
  password: string
}

export type LoginTokens = {
  accessToken: string
  refreshToken: string
}

export async function loginRequest(body: LoginBody): Promise<LoginTokens> {
  const res = await apiClient.post<ResponseApi<LoginTokens>>('/api/v1/auth/login', body)
  return unwrapResponseApi(res.data)
}
