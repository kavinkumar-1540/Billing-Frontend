import { apiClient } from '@/lib/api-client'
import type {
  CreateRolePayload,
  PermissionCatalogItem,
  Role,
  UpdateRolePayload,
} from './roles-permissions.types'

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>('/roles')
  return data
}

export async function fetchPermissionCatalog(): Promise<PermissionCatalogItem[]> {
  const { data } = await apiClient.get<PermissionCatalogItem[]>('/roles/permissions/catalog')
  return data
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
