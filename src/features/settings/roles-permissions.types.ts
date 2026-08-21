export interface Role {
  _id: string
  name: string
  roleKey: string
  description: string
  active: boolean
  isSystemDefault: boolean
}

export interface SubModuleNode {
  _id: string
  moduleId: string
  subModuleName: string
  unique_key: string
  parentSubModuleId?: string
}

export interface PermissionModuleNode {
  _id: string
  moduleName: string
  path: string
  icon: string
  order: number
  subModule: SubModuleNode[]
}

export interface CreateRolePayload {
  name: string
  roleKey: string
  description?: string
}

export interface UpdateRolePayload {
  name?: string
  description?: string
  active?: boolean
}

export interface CreatePermissionPayload {
  role_key: string
  permissionId: string[]
}

export interface RolePermissionsDetail {
  modules: PermissionModuleNode[]
  permissionsDetails: SubModuleNode[]
}
