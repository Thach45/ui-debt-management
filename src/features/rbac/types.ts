/** Khớp `RoleResponseDTO` backend */
export type RoleDto = {
  id: string
  name: 'ADMIN' | 'STAFF'
  description: string | null
  permissionCodes: string[]
}

/** Khớp `PermissionSummaryDTO` — catalog endpoint */
export type PermissionCatalogItem = {
  id: string
  code: string
  description: string | null
  module: string | null
}

export type RoleUpdatePayload = {
  description?: string
  permissionCodes?: string[]
}
