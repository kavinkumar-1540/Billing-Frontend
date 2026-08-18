import { apiClient } from '@/lib/api-client'
import type {
  CompanyUserListItem,
  CreateCompanyUserPayload,
  UpdateCompanyUserProfilePayload,
} from './company-users.types'

export async function fetchCompanyUsers(): Promise<CompanyUserListItem[]> {
  const { data } = await apiClient.get<CompanyUserListItem[]>('/company-members')
  return data
}

export async function createCompanyUser(payload: CreateCompanyUserPayload): Promise<CompanyUserListItem> {
  const { data } = await apiClient.post<CompanyUserListItem>('/company-members', payload)
  return data
}

export async function updateCompanyUserRole(companyMemberId: string, roleId: string): Promise<void> {
  await apiClient.patch(`/company-members/${companyMemberId}/role`, { roleId })
}

export async function setCompanyUserStatus(companyMemberId: string, isActive: boolean): Promise<void> {
  await apiClient.patch(`/company-members/${companyMemberId}/status`, { isActive })
}

export async function updateCompanyUserProfile(
  companyMemberId: string,
  payload: UpdateCompanyUserProfilePayload,
): Promise<void> {
  await apiClient.patch(`/company-members/${companyMemberId}/profile`, payload)
}

export async function removeCompanyUser(companyMemberId: string): Promise<void> {
  await apiClient.delete(`/company-members/${companyMemberId}`)
}
