import { apiClient, unwrapResponseApi } from '@/shared/api/client'
import type { ResponseApi } from '@/shared/types/api'

import type { PermissionCatalogItem, RoleDto, RoleUpdatePayload } from '@/features/rbac/types'

export async function fetchRoles(): Promise<RoleDto[]> {
  const res = await apiClient.get<ResponseApi<RoleDto[]>>('/api/v1/roles')
  return unwrapResponseApi(res.data)
}

export async function fetchPermissionCatalog(): Promise<PermissionCatalogItem[]> {
  const res = await apiClient.get<ResponseApi<PermissionCatalogItem[]>>('/api/v1/permissions')
  return unwrapResponseApi(res.data)
}

export async function updateRole(id: string, payload: RoleUpdatePayload): Promise<RoleDto> {
  const res = await apiClient.put<ResponseApi<RoleDto>>(`/api/v1/roles/${id}`, payload)
  return unwrapResponseApi(res.data)
}
