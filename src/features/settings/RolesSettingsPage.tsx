import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/EmptyState'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { fetchRoles, fetchPermissionCatalog, createRole, updateRole, deleteRole } from './roles-permissions.api'
import type { Role } from './roles-permissions.types'

function groupByCategory(keys: string[]): Record<string, string[]> {
  return keys.reduce<Record<string, string[]>>((acc, key) => {
    const category = key.split(':')[0]
    acc[category] ??= []
    acc[category].push(key)
    return acc
  }, {})
}

export default function RolesSettingsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())

  const { data: roles, isLoading } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles })
  const { data: catalog } = useQuery({ queryKey: ['permission-catalog'], queryFn: fetchPermissionCatalog })

  const groups = useMemo(() => groupByCategory((catalog ?? []).map((c) => c.key)), [catalog])
  const descriptionByKey = useMemo(
    () => new Map((catalog ?? []).map((c) => [c.key, c.description])),
    [catalog],
  )

  useEffect(() => {
    if (editingRole) {
      setName(editingRole.name)
      setSelectedPermissions(new Set(editingRole.permissions))
    } else {
      setName('')
      setSelectedPermissions(new Set())
    }
  }, [editingRole])

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['roles'] })

  const saveMutation = useMutation({
    mutationFn: () => {
      const permissions = Array.from(selectedPermissions)
      return editingRole ? updateRole(editingRole._id, { name, permissions }) : createRole({ name, permissions })
    },
    onSuccess: () => {
      toast.success(editingRole ? 'Role updated' : 'Role created')
      invalidate()
      setOpen(false)
      setEditingRole(null)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to save role')
          : 'Failed to save role'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      toast.success('Role deleted')
      invalidate()
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to delete role')
          : 'Failed to delete role'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleCategory = (keys: string[]) => {
    setSelectedPermissions((prev) => {
      const allChecked = keys.every((k) => prev.has(k))
      const next = new Set(prev)
      keys.forEach((k) => (allChecked ? next.delete(k) : next.add(k)))
      return next
    })
  }

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'name',
      header: 'Role',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{r.name}</span>
          {r.isSystemDefault && <Badge variant="secondary">System</Badge>}
        </div>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (r) => <span className="text-xs text-muted-foreground">{r.permissions.length} granted</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) =>
        r.isSystemDefault ? (
          <span className="text-xs text-muted-foreground">Read-only</span>
        ) : (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingRole(r)
                setOpen(true)
              }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(r._id)}
            >
              Delete
            </Button>
          </div>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Create custom roles and control which actions each role can perform"
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingRole(null)
              setOpen(true)
            }}
          >
            <Plus className="size-4" />
            New Role
          </Button>
        }
      />

      {!isLoading && roles?.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No roles found" />
      ) : (
        <DataTable columns={columns} data={roles ?? []} rowKey={(r) => r._id} isLoading={isLoading} />
      )}

      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditingRole(null)
        }}
      >
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingRole ? `Edit ${editingRole.name}` : 'New Role'}</SheetTitle>
          </SheetHeader>
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
          >
            <SheetBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input id="roleName" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                {Object.entries(groups).map(([category, keys]) => {
                  const allChecked = keys.every((k) => selectedPermissions.has(k))
                  return (
                    <div key={category} className="rounded-md border p-3">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium capitalize">
                        <input type="checkbox" checked={allChecked} onChange={() => toggleCategory(keys)} />
                        {category}
                      </label>
                      <div className="space-y-1.5 pl-6">
                        {keys.map((key) => (
                          <label key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.has(key)}
                              onChange={() => togglePermission(key)}
                            />
                            {descriptionByKey.get(key) ?? key}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : 'Save Role'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
