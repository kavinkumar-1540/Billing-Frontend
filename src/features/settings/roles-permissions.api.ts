import { apiClient } from '@/lib/api-client'
import type {
  CreatePermissionPayload,
  CreateRolePayload,
  PermissionModuleNode,
  Role,
  RolePermissionsDetail,
  UpdateRolePayload,
} from './roles-permissions.types'

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>('/roles')
  return data
}

export async function fetchPermissionModules(): Promise<PermissionModuleNode[]> {
  const { data } = await apiClient.get<PermissionModuleNode[]>('/permissions/modules')
  return data
}

export async function fetchRolePermissions(roleKey: string): Promise<RolePermissionsDetail> {
  const { data } = await apiClient.get<RolePermissionsDetail>(`/permissions/by-role/${roleKey}`)
  return data
}

export async function savePermissions(payload: CreatePermissionPayload): Promise<void> {
  await apiClient.post('/permissions', [payload])
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data } = await apiClient.post<Role>('/roles', payload)
  return data
}

export async function updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
  const { data } = await apiClient.patch<Role>(`/roles/${id}`, payload)
  return data
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`)
}
