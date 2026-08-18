import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, Users as UsersIcon } from 'lucide-react'
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
import {
  fetchCompanyUsers,
  createCompanyUser,
  updateCompanyUserRole,
  setCompanyUserStatus,
  updateCompanyUserProfile,
  removeCompanyUser,
} from './company-users.api'
import { fetchRoles } from './roles-permissions.api'
import type { CompanyUserListItem } from './company-users.types'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function UsersSettingsPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [editingUser, setEditingUser] = useState<CompanyUserListItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const { data: users, isLoading } = useQuery({ queryKey: ['company-users'], queryFn: fetchCompanyUsers })
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles })

  const filteredUsers = useMemo(() => {
    const all = users ?? []
    if (!searchQuery) return all
    const q = searchQuery.toLowerCase()
    return all.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.roleName.toLowerCase().includes(q),
    )
  }, [users, searchQuery])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['company-users'] })
  }

  const createMutation = useMutation({
    mutationFn: () => createCompanyUser({ email, name, password, roleId, isActive }),
    onSuccess: () => {
      toast.success('User added')
      invalidate()
      setOpen(false)
      setEmail('')
      setName('')
      setPassword('')
      setRoleId('')
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
      updateCompanyUserRole(companyMemberId, newRoleId),
    onSuccess: () => {
      toast.success('Role updated')
      invalidate()
    },
    onError: () => toast.error('Failed to update role'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ companyMemberId, isActive: nextActive }: { companyMemberId: string; isActive: boolean }) =>
      setCompanyUserStatus(companyMemberId, nextActive),
    onSuccess: () => {
      toast.success('Status updated')
      invalidate()
    },
    onError: () => toast.error('Failed to update status'),
  })

  const editMutation = useMutation({
    mutationFn: () => updateCompanyUserProfile(editingUser!.companyMemberId, { name: editName, email: editEmail }),
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

  const deleteMutation = useMutation({
    mutationFn: (companyMemberId: string) => removeCompanyUser(companyMemberId),
    onSuccess: () => {
      toast.success('User removed')
      invalidate()
    },
    onError: () => toast.error('Failed to remove user'),
  })

  const columns: DataTableColumn<CompanyUserListItem>[] = [
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
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <select
          className="glass-input flex h-8 cursor-pointer rounded-lg px-2 text-xs font-medium"
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
      render: (u) => {
        const isSelf = u.userId === session?.userId
        return (
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
              disabled={isSelf || statusMutation.isPending}
              title={isSelf ? "You can't change your own status" : undefined}
              onClick={() => statusMutation.mutate({ companyMemberId: u.companyMemberId, isActive: !u.isActive })}
            >
              {u.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isSelf || deleteMutation.isPending}
              title={isSelf ? "You can't remove yourself" : 'Remove user'}
              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              onClick={() => {
                if (window.confirm(`Remove ${u.name} from this company?`)) {
                  deleteMutation.mutate(u.companyMemberId)
                }
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage who can access this company and what role they have"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add User
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search name, email, or role…" />
      </div>

      {!isLoading && (users ?? []).length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users yet"
          description="Add teammates to this company and assign them a role."
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
                <Label htmlFor="userName">Name *</Label>
                <Input id="userName" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="userEmail">Email *</Label>
                <Input id="userEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="userPassword">Temporary Password *</Label>
                <Input
                  id="userPassword"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="userRole">Role *</Label>
                <select
                  id="userRole"
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
                <Label htmlFor="userStatus">Account Status</Label>
                <select
                  id="userStatus"
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
                <Label htmlFor="editUserName">Name *</Label>
                <Input id="editUserName" required value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editUserEmail">Email *</Label>
                <Input id="editUserEmail" type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
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
