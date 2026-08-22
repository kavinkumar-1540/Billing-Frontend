import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/EmptyState'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/AuthContext'
import { fetchAllCompanies } from '@/features/companies/companies.api'
import { fetchRoles } from '@/features/settings/roles-permissions.api'
import {
  fetchPlatformUsers,
  createPlatformUser,
  updatePlatformUserRole,
  setPlatformUserStatus,
  updatePlatformUserProfile,
} from './platform-users.api'
import type { PlatformUserListItem } from './platform-users.types'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function PlatformUsersPage() {
  const { hasPermission, permissionsLoading } = useAuth()
  const canManage = hasPermission('manage_platform_users')
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const [open, setOpen] = useState(false)
  const [companyId, setCompanyId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [editingUser, setEditingUser] = useState<PlatformUserListItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['platform-users'],
    queryFn: fetchPlatformUsers,
    enabled: !permissionsLoading && canManage,
  })
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchAllCompanies,
    enabled: !permissionsLoading && canManage,
  })
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles })

  const filteredUsers = useMemo(() => {
    const all = users ?? []
    if (!searchQuery) return all
    const q = searchQuery.toLowerCase()
    return all.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roleName.toLowerCase().includes(q) ||
        u.companyName.toLowerCase().includes(q),
    )
  }, [users, searchQuery])

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['platform-users'] })

  const createMutation = useMutation({
    mutationFn: () => createPlatformUser({ companyId, roleId, name, email, password, isActive }),
    onSuccess: () => {
      toast.success('User added')
      invalidate()
      setOpen(false)
      setCompanyId('')
      setRoleId('')
      setName('')
      setEmail('')
      setPassword('')
      setIsActive(true)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to add user')
          : 'Failed to add user'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ companyMemberId, roleId: newRoleId }: { companyMemberId: string; roleId: string }) =>
      updatePlatformUserRole(companyMemberId, newRoleId),
    onSuccess: () => {
      toast.success('Role updated')
      invalidate()
    },
    onError: () => toast.error('Failed to update role'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ companyMemberId, isActive: nextActive }: { companyMemberId: string; isActive: boolean }) =>
      setPlatformUserStatus(companyMemberId, nextActive),
    onSuccess: () => {
      toast.success('Status updated')
      invalidate()
    },
    onError: () => toast.error('Failed to update status'),
  })

  const editMutation = useMutation({
    mutationFn: () => updatePlatformUserProfile(editingUser!.companyMemberId, { name: editName, email: editEmail }),
    onSuccess: () => {
      toast.success('User updated')
      invalidate()
      setEditingUser(null)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to update user')
          : 'Failed to update user'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const columns: DataTableColumn<PlatformUserListItem>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px]">{initials(u.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{u.name}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (u) => u.email },
    { key: 'company', header: 'Company', render: (u) => u.companyName },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <select
          className="glass-input flex h-8 cursor-pointer rounded-lg px-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
          value={u.roleId}
          onChange={(e) => roleMutation.mutate({ companyMemberId: u.companyMemberId, roleId: e.target.value })}
          disabled={roleMutation.isPending}
        >
          {roles?.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <Badge variant={u.isActive ? 'success' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-IN') : 'Never'),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            title="Edit user"
            onClick={() => {
              setEditingUser(u)
              setEditName(u.name)
              setEditEmail(u.email)
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate({ companyMemberId: u.companyMemberId, isActive: !u.isActive })}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  if (!permissionsLoading && !canManage) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <PageHeader
        title="Platform Users"
        description="Every user across every company on this platform"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add User
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search name, email, company, or role…" />
      </div>

      {!isLoading && (users ?? []).length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users yet"
          description="Add a user to any company on the platform."
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Add User
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          rowKey={(u) => u.companyMemberId}
          isLoading={isLoading}
          emptyTitle="No users match your search"
        />
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add User</SheetTitle>
          </SheetHeader>
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate()
            }}
          >
            <SheetBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="platformUserCompany">Company *</Label>
                <select
                  id="platformUserCompany"
                  required
                  className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <option value="">Select company</option>
                  {companies?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="platformUserRole">Role *</Label>
                <select
                  id="platformUserRole"
                  required
                  className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  <option value="">Select role</option>
                  {roles?.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="platformUserName">Name *</Label>
                <Input id="platformUserName" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="platformUserEmail">Email *</Label>
                <Input
                  id="platformUserEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="platformUserPassword">Temporary Password *</Label>
                <Input
                  id="platformUserPassword"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="platformUserStatus">Account Status</Label>
                <select
                  id="platformUserStatus"
                  className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding…' : 'Add User'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(editingUser)} onOpenChange={(next) => !next && setEditingUser(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit {editingUser?.name}</SheetTitle>
          </SheetHeader>
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault()
              editMutation.mutate()
            }}
          >
            <SheetBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="editPlatformUserName">Name *</Label>
                <Input id="editPlatformUserName" required value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editPlatformUserEmail">Email *</Label>
                <Input
                  id="editPlatformUserEmail"
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
