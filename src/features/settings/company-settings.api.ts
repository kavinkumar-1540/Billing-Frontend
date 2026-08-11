import { apiClient } from '@/lib/api-client'
import type { CompanyProfile, UpdateCompanyPayload } from './company-settings.types'

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  const { data } = await apiClient.get<CompanyProfile>('/companies/current')
  return data
}

export async function updateCompanyProfile(payload: UpdateCompanyPayload): Promise<CompanyProfile> {
  const { data } = await apiClient.patch<CompanyProfile>('/companies/current', payload)
  return data
}
