import { apiClient } from '@/lib/api-client'
import type { CompanyListItem, CreateCompanyPayload, UpdateCompanyPayload } from './companies.types'

export async function fetchAllCompanies(): Promise<CompanyListItem[]> {
  const { data } = await apiClient.get<CompanyListItem[]>('/companies')
  return data
}

export async function createCompany(payload: CreateCompanyPayload): Promise<CompanyListItem> {
  const { data } = await apiClient.post<CompanyListItem>('/companies', payload)
  return data
}

export async function updateCompany(id: string, payload: UpdateCompanyPayload): Promise<CompanyListItem> {
  const { data } = await apiClient.patch<CompanyListItem>(`/companies/${id}`, payload)
  return data
}

export async function deactivateCompany(id: string): Promise<CompanyListItem> {
  const { data } = await apiClient.patch<CompanyListItem>(`/companies/${id}/deactivate`)
  return data
}

export async function reactivateCompany(id: string): Promise<CompanyListItem> {
  const { data } = await apiClient.patch<CompanyListItem>(`/companies/${id}/reactivate`)
  return data
}
