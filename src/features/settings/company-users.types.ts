export interface CompanyUserListItem {
  companyMemberId: string
  userId: string
  name: string
  email: string
  roleId: string
  roleName: string
  isActive: boolean
  lastLoginAt?: string
}

export interface CreateCompanyUserPayload {
  email: string
  name: string
  password: string
  roleId: string
  isActive?: boolean
}

export interface UpdateCompanyUserProfilePayload {
  name?: string
  email?: string
}
