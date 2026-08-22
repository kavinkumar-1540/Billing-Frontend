import { apiClient } from '@/lib/api-client'
import type {
  PlatformUserListItem,
  CreatePlatformUserPayload,
  UpdatePlatformUserProfilePayload,
} from './platform-users.types'

export async function fetchPlatformUsers(): Promise<PlatformUserListItem[]> {
  const { data } = await apiClient.get<PlatformUserListItem[]>('/platform-users')
  return data
}

export async function createPlatformUser(payload: CreatePlatformUserPayload): Promise<PlatformUserListItem> {
  const { data } = await apiClient.post<PlatformUserListItem>('/platform-users', payload)
  return data
}

export async function updatePlatformUserRole(companyMemberId: string, roleId: string): Promise<void> {
  await apiClient.patch(`/platform-users/${companyMemberId}/role`, { roleId })
}

export async function setPlatformUserStatus(companyMemberId: string, isActive: boolean): Promise<void> {
  await apiClient.patch(`/platform-users/${companyMemberId}/status`, { isActive })
}

export async function updatePlatformUserProfile(
  companyMemberId: string,
  payload: UpdatePlatformUserProfilePayload,
): Promise<void> {
  await apiClient.patch(`/platform-users/${companyMemberId}/profile`, payload)
}
