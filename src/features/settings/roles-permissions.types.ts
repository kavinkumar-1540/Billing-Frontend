export interface Role {
  _id: string
  companyId: string | null
  name: string
  permissions: string[]
  isSystemDefault: boolean
}

export interface PermissionCatalogItem {
  key: string
  description: string
}

export interface CreateRolePayload {
  name: string
  permissions: string[]
}

export interface UpdateRolePayload {
  name?: string
  permissions?: string[]
}
