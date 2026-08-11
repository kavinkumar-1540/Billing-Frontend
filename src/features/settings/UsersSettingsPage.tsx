import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/EmptyState'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/AuthContext'
import { fetchCompanyUsers, createCompanyUser, updateCompanyUserRole, setCompanyUserStatus } from './company-users.api'
import { fetchRoles } from './roles-permissions.api'
import type { CompanyUserListItem } from './company-users.types'

export default function UsersSettingsPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')

  const { data: users, isLoading } = useQuery({ queryKey: ['company-users'], queryFn: fetchCompanyUsers })
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['company-users'] })
  }

  const createMutation = useMutation({
    mutationFn: () => createCompanyUser({ email, name, password, roleId }),
    onSuccess: () => {
      toast.success('User added')
      invalidate()
      setOpen(false)
      setEmail('')
      setName('')
      setPassword('')
      setRoleId('')
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
    mutationFn: ({ companyMemberId, isActive }: { companyMemberId: string; isActive: boolean }) =>
      setCompanyUserStatus(companyMemberId, isActive),
    onSuccess: () => {
      toast.success('Status updated')
      invalidate()
    },
    onError: () => toast.error('Failed to update status'),
  })

  const columns: DataTableColumn<CompanyUserListItem>[] = [
    { key: 'name', header: 'Name', render: (u) => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: 'Email', render: (u) => u.email },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <select
          className="flex h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
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
          <Button
            variant="outline"
            size="sm"
            disabled={isSelf || statusMutation.isPending}
            title={isSelf ? "You can't change your own status" : undefined}
            onClick={() => statusMutation.mutate({ companyMemberId: u.companyMemberId, isActive: !u.isActive })}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </Button>
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

      {!isLoading && users?.length === 0 ? (
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
        <DataTable columns={columns} data={users ?? []} rowKey={(u) => u.companyMemberId} isLoading={isLoading} />
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
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
    </div>
  )
}
