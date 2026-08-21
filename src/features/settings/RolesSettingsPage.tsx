import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/AuthContext'
import {
  fetchRoles,
  fetchPermissionModules,
  fetchRolePermissions,
  savePermissions,
  createRole,
  deleteRole,
} from './roles-permissions.api'
import type { PermissionModuleNode } from './roles-permissions.types'

function toRoleKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

interface PermissionMatrixProps {
  modules: PermissionModuleNode[]
  allActionLabels: string[]
  selected: Set<string>
  editable: boolean
  onToggle: (id: string) => void
  onToggleModule: (ids: string[]) => void
}

function PermissionMatrix({ modules, allActionLabels, selected, editable, onToggle, onToggleModule }: PermissionMatrixProps) {
  return (
    <div className="glass-2 overflow-x-auto rounded-2xl">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-slate-900/50 text-left text-slate-400">
            <th className="px-3 py-2 font-semibold">Module</th>
            {allActionLabels.map((action) => (
              <th key={action} className="px-3 py-2 text-center font-semibold">
                {action}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-semibold">All</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((mod) => {
            const rowIds = mod.subModule.map((s) => s._id)
            const allChecked = rowIds.length > 0 && rowIds.every((id) => selected.has(id))
            return (
              <tr key={mod._id} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2 font-medium text-slate-200">{mod.moduleName}</td>
                {allActionLabels.map((action) => {
                  const match = mod.subModule.find((s) => s.subModuleName === action)
                  if (!match) return <td key={action} className="px-3 py-2 text-center text-slate-500">—</td>
                  return (
                    <td key={action} className="px-3 py-2 text-center" title={match.unique_key}>
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer accent-cyan-500 disabled:cursor-not-allowed disabled:accent-slate-500"
                        checked={selected.has(match._id)}
                        disabled={!editable}
                        onChange={() => onToggle(match._id)}
                      />
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    className="size-4 cursor-pointer accent-cyan-500 disabled:cursor-not-allowed disabled:accent-slate-500"
                    checked={allChecked}
                    disabled={!editable}
                    onChange={() => onToggleModule(rowIds)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function RolesSettingsPage() {
  const { hasPermission, refreshPermissions, activeCompany } = useAuth()
  const canManage = hasPermission('users:manage')
  const queryClient = useQueryClient()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [draftPermissions, setDraftPermissions] = useState<Set<string>>(new Set())

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const { data: roles, isLoading } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles })
  const { data: modulesData } = useQuery({ queryKey: ['permission-modules'], queryFn: fetchPermissionModules })
  const modules = useMemo(() => modulesData ?? [], [modulesData])
  const allActionLabels = useMemo(
    () => Array.from(new Set(modules.flatMap((m) => m.subModule.map((s) => s.subModuleName)))),
    [modules],
  )

  useEffect(() => {
    if (!roles || roles.length === 0) return
    if (!selectedRoleId || !roles.some((r) => r._id === selectedRoleId)) {
      setSelectedRoleId(roles[0]._id)
    }
  }, [roles, selectedRoleId])

  const selectedRole = roles?.find((r) => r._id === selectedRoleId) ?? null
  const isLockedRole = selectedRole?.roleKey === 'admin'

  const { data: rolePermissions } = useQuery({
    queryKey: ['role-permissions', selectedRole?.roleKey],
    queryFn: () => fetchRolePermissions(selectedRole!.roleKey),
    enabled: Boolean(selectedRole),
  })

  useEffect(() => {
    setDraftPermissions(new Set((rolePermissions?.permissionsDetails ?? []).map((s) => s._id)))
  }, [rolePermissions])

  const grantedIds = useMemo(
    () => new Set((rolePermissions?.permissionsDetails ?? []).map((s) => s._id)),
    [rolePermissions],
  )
  const totalPermissionCount = useMemo(
    () => modules.reduce((sum, m) => sum + m.subModule.length, 0),
    [modules],
  )

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['roles'] })
    void queryClient.invalidateQueries({ queryKey: ['role-permissions'] })
  }

  const createMutation = useMutation({
    mutationFn: () => createRole({ name, roleKey: toRoleKey(name) }),
    onSuccess: (role) => {
      toast.success('Role created')
      invalidate()
      setOpen(false)
      setName('')
      setSelectedRoleId(role._id)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to create role')
          : 'Failed to create role'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      savePermissions({ role_key: selectedRole!.roleKey, permissionId: Array.from(draftPermissions) }),
    onSuccess: () => {
      toast.success('Permissions updated')
      invalidate()
      if (selectedRole?.roleKey === activeCompany?.roleKey) refreshPermissions()
    },
    onError: () => toast.error('Failed to save permissions'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      toast.success('Role deleted')
      setSelectedRoleId(null)
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

  const togglePermission = (id: string) => {
    setDraftPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleModule = (ids: string[]) => {
    setDraftPermissions((prev) => {
      const allChecked = ids.every((id) => prev.has(id))
      const next = new Set(prev)
      ids.forEach((id) => (allChecked ? next.delete(id) : next.add(id)))
      return next
    })
  }

  const isDirty =
    draftPermissions.size !== grantedIds.size || Array.from(grantedIds).some((id) => !draftPermissions.has(id))

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Select a role to view or edit which actions it can perform"
        actions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              New Role
            </Button>
          ) : undefined
        }
      />

      {!isLoading && (roles ?? []).length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No roles found" />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roles?.map((role) => (
              <button
                key={role._id}
                type="button"
                onClick={() => setSelectedRoleId(role._id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  role._id === selectedRoleId
                    ? 'border-cyan-500/40 bg-gradient-to-br from-cyan-500/15 to-blue-500/5 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'glass-2 border-white/10 hover:border-cyan-500/20'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{role.name}</span>
                  {role.isSystemDefault && (
                    <Badge variant="secondary" className="shrink-0">
                      System
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {role._id === selectedRoleId ? grantedIds.size : '—'} of {totalPermissionCount} permissions granted
                </p>
              </button>
            ))}
          </div>

          {selectedRole && (
            <Card className="p-6">
              <CardContent className="space-y-4 p-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{selectedRole.name}</h3>
                    <p className="text-xs text-slate-400">
                      {isLockedRole
                        ? 'The Admin role always has full access and cannot be edited.'
                        : canManage
                          ? 'Check the permissions this role should have, then save.'
                          : "You don't have permission to edit roles."}
                    </p>
                  </div>
                  {!isLockedRole && canManage && (
                    <div className="flex gap-2">
                      {!selectedRole.isSystemDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`Delete role "${selectedRole.name}"?`)) {
                              deleteMutation.mutate(selectedRole._id)
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      )}
                      <Button size="sm" disabled={!isDirty || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                        {saveMutation.isPending ? 'Saving…' : 'Save Permissions'}
                      </Button>
                    </div>
                  )}
                </div>

                <PermissionMatrix
                  modules={modules}
                  allActionLabels={allActionLabels}
                  selected={draftPermissions}
                  editable={!isLockedRole && canManage}
                  onToggle={togglePermission}
                  onToggleModule={toggleModule}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Role</SheetTitle>
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
                <Label htmlFor="roleName">Role Name *</Label>
                <Input id="roleName" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <p className="text-xs text-slate-400">
                The role is created with no permissions granted — select it from the main page afterward to assign permissions.
              </p>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create Role'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
