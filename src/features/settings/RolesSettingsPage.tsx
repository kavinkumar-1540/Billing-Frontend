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
import { fetchRoles, fetchPermissionCatalog, createRole, updateRole, deleteRole } from './roles-permissions.api'

interface CategoryRow {
  category: string
  actions: { key: string; action: string; description: string }[]
}

function groupByCategory(catalog: { key: string; description: string }[]): CategoryRow[] {
  const map = new Map<string, CategoryRow>()
  for (const { key, description } of catalog) {
    const [category, action] = key.split(':')
    if (!map.has(category)) map.set(category, { category, actions: [] })
    map.get(category)!.actions.push({ key, action, description })
  }
  return Array.from(map.values())
}

function toTitleCase(value: string) {
  return value[0].toUpperCase() + value.slice(1)
}

interface PermissionMatrixProps {
  rows: CategoryRow[]
  allActionLabels: string[]
  selected: Set<string>
  editable: boolean
  onToggle: (key: string) => void
  onToggleCategory: (keys: string[]) => void
}

function PermissionMatrix({ rows, allActionLabels, selected, editable, onToggle, onToggleCategory }: PermissionMatrixProps) {
  return (
    <div className="glass-2 overflow-x-auto rounded-2xl">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-slate-900/50 text-left text-slate-400">
            <th className="px-3 py-2 font-semibold">Module</th>
            {allActionLabels.map((action) => (
              <th key={action} className="px-3 py-2 text-center font-semibold capitalize">
                {action}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-semibold">All</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowKeys = row.actions.map((a) => a.key)
            const allChecked = rowKeys.every((k) => selected.has(k))
            return (
              <tr key={row.category} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2 font-medium text-slate-200">{toTitleCase(row.category)}</td>
                {allActionLabels.map((action) => {
                  const match = row.actions.find((a) => a.action === action)
                  if (!match) return <td key={action} className="px-3 py-2 text-center text-slate-500">—</td>
                  return (
                    <td key={action} className="px-3 py-2 text-center" title={match.description}>
                      <input
                        type="checkbox"
                        className="cursor-pointer accent-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                        checked={selected.has(match.key)}
                        disabled={!editable}
                        onChange={() => onToggle(match.key)}
                      />
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    className="cursor-pointer accent-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                    checked={allChecked}
                    disabled={!editable}
                    onChange={() => onToggleCategory(rowKeys)}
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
  const queryClient = useQueryClient()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [draftPermissions, setDraftPermissions] = useState<Set<string>>(new Set())

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const { data: roles, isLoading } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles })
  const { data: catalog } = useQuery({ queryKey: ['permission-catalog'], queryFn: fetchPermissionCatalog })

  const rows = useMemo(() => groupByCategory(catalog ?? []), [catalog])
  const allActionLabels = useMemo(
    () => Array.from(new Set(rows.flatMap((r) => r.actions.map((a) => a.action)))),
    [rows],
  )

  useEffect(() => {
    if (!roles || roles.length === 0) return
    if (!selectedRoleId || !roles.some((r) => r._id === selectedRoleId)) {
      setSelectedRoleId(roles[0]._id)
    }
  }, [roles, selectedRoleId])

  const selectedRole = roles?.find((r) => r._id === selectedRoleId) ?? null

  useEffect(() => {
    setDraftPermissions(new Set(selectedRole?.permissions ?? []))
  }, [selectedRole])

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['roles'] })

  const createMutation = useMutation({
    mutationFn: () => createRole({ name, permissions: [] }),
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
    mutationFn: () => updateRole(selectedRole!._id, { permissions: Array.from(draftPermissions) }),
    onSuccess: () => {
      toast.success('Permissions updated')
      invalidate()
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

  const togglePermission = (key: string) => {
    setDraftPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleCategory = (keys: string[]) => {
    setDraftPermissions((prev) => {
      const allChecked = keys.every((k) => prev.has(k))
      const next = new Set(prev)
      keys.forEach((k) => (allChecked ? next.delete(k) : next.add(k)))
      return next
    })
  }

  const isDirty =
    selectedRole != null &&
    (draftPermissions.size !== selectedRole.permissions.length ||
      selectedRole.permissions.some((p) => !draftPermissions.has(p)))

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Select a role to view or edit which actions it can perform"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New Role
          </Button>
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
                  {role.permissions.length} of {catalog?.length ?? 0} permissions granted
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
                      {selectedRole.isSystemDefault
                        ? 'System default role — permissions are fixed and cannot be edited.'
                        : 'Custom role — check the permissions this role should have, then save.'}
                    </p>
                  </div>
                  {!selectedRole.isSystemDefault && (
                    <div className="flex gap-2">
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
                      <Button size="sm" disabled={!isDirty || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                        {saveMutation.isPending ? 'Saving…' : 'Save Permissions'}
                      </Button>
                    </div>
                  )}
                </div>

                <PermissionMatrix
                  rows={rows}
                  allActionLabels={allActionLabels}
                  selected={draftPermissions}
                  editable={!selectedRole.isSystemDefault}
                  onToggle={togglePermission}
                  onToggleCategory={toggleCategory}
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
