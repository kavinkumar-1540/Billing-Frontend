export interface PlatformUserListItem {
  companyMemberId: string
  userId: string
  name: string
  email: string
  roleId: string
  roleName: string
  companyId: string
  companyName: string
  isActive: boolean
  lastLoginAt?: string
}

export interface CreatePlatformUserPayload {
  companyId: string
  roleId: string
  name: string
  email: string
  password: string
  isActive?: boolean
}

export interface UpdatePlatformUserProfilePayload {
  name?: string
  email?: string
}
