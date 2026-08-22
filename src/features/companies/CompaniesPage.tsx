import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/AuthContext'
import { fetchAllCompanies, createCompany, updateCompany, deactivateCompany, reactivateCompany } from './companies.api'
import type { CompanyListItem } from './companies.types'

const emptyForm = {
  name: '',
  slug: '',
  gstin: '',
  pan: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
}

const emptyEditForm = {
  name: '',
  phone: '',
  email: '',
  gstin: '',
  pan: '',
}

export default function CompaniesPage() {
  const { hasPermission, permissionsLoading } = useAuth()
  const canEdit = hasPermission('edit_company')
  const canDeactivate = hasPermission('delete_company')
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingCompany, setEditingCompany] = useState<CompanyListItem | null>(null)
  const [editForm, setEditForm] = useState(emptyEditForm)

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchAllCompanies,
    enabled: !permissionsLoading && hasPermission('add_company'),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createCompany({
        name: form.name,
        slug: form.slug,
        gstin: form.gstin || undefined,
        pan: form.pan || undefined,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      }),
    onSuccess: () => {
      toast.success('Company created')
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
      setOpen(false)
      setForm(emptyForm)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to create company')
          : 'Failed to create company'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateCompany(editingCompany!._id, {
      name: editForm.name || undefined,
      phone: editForm.phone || undefined,
      email: editForm.email || undefined,
      gstin: editForm.gstin || undefined,
      pan: editForm.pan || undefined,
    }),
    onSuccess: () => {
      toast.success('Company updated')
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
      setEditingCompany(null)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to update company')
          : 'Failed to update company'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (company: CompanyListItem) =>
      company.isActive ? deactivateCompany(company._id) : reactivateCompany(company._id),
    onSuccess: (_data, company) => {
      toast.success(company.isActive ? 'Company deactivated' : 'Company reactivated')
      void queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    onError: () => toast.error('Failed to update company status'),
  })

  const columns: DataTableColumn<CompanyListItem>[] = [
    { key: 'name', header: 'Company', render: (c) => <span className="font-medium">{c.name}</span> },
    { key: 'slug', header: 'Slug', render: (c) => c.slug },
    { key: 'gstin', header: 'GSTIN', render: (c) => c.gstin ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (c) => new Date(c.createdAt).toLocaleDateString('en-IN'),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1.5">
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              title="Edit company"
              onClick={() => {
                setEditingCompany(c)
                setEditForm({
                  name: c.name,
                  phone: c.phone ?? '',
                  email: c.email ?? '',
                  gstin: c.gstin ?? '',
                  pan: c.pan ?? '',
                })
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          {canDeactivate && (
            <Button
              variant="ghost"
              size="icon"
              title={c.isActive ? 'Deactivate company' : 'Reactivate company'}
              className={c.isActive ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300' : undefined}
              disabled={toggleActiveMutation.isPending}
              onClick={() => {
                if (c.isActive && !window.confirm(`Deactivate "${c.name}"? All its members will lose access.`)) return
                toggleActiveMutation.mutate(c)
              }}
            >
              {c.isActive ? <PowerOff className="size-3.5" /> : <Power className="size-3.5" />}
            </Button>
          )}
        </div>
      ),
    },
  ]

  if (!permissionsLoading && !hasPermission('add_company')) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Every tenant company on this platform"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Create Company
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={companies ?? []}
        rowKey={(c) => c._id}
        isLoading={isLoading}
        emptyTitle="No companies yet"
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="size-4" />
              Create Company
            </SheetTitle>
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
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companySlug">Slug *</Label>
                <Input
                  id="companySlug"
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="acme-traders"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="companyGstin">GSTIN</Label>
                  <Input
                    id="companyGstin"
                    value={form.gstin}
                    onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="companyPan">PAN</Label>
                  <Input
                    id="companyPan"
                    value={form.pan}
                    onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value }))}
                  />
                </div>
              </div>

              <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                First admin user
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="adminName">Name *</Label>
                <Input
                  id="adminName"
                  required
                  value={form.adminName}
                  onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adminEmail">Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  required
                  value={form.adminEmail}
                  onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adminPassword">Temporary Password *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  required
                  minLength={8}
                  value={form.adminPassword}
                  onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
                />
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create Company'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(editingCompany)} onOpenChange={(next) => !next && setEditingCompany(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="size-4" />
              Edit {editingCompany?.name}
            </SheetTitle>
          </SheetHeader>
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault()
              updateMutation.mutate()
            }}
          >
            <SheetBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="editCompanyName">Company Name *</Label>
                <Input
                  id="editCompanyName"
                  required
                  minLength={2}
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editCompanyPhone">Phone</Label>
                <Input
                  id="editCompanyPhone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editCompanyEmail">Email</Label>
                <Input
                  id="editCompanyEmail"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editCompanyGstin">GSTIN</Label>
                  <Input
                    id="editCompanyGstin"
                    value={editForm.gstin}
                    onChange={(e) => setEditForm((f) => ({ ...f, gstin: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editCompanyPan">PAN</Label>
                  <Input
                    id="editCompanyPan"
                    value={editForm.pan}
                    onChange={(e) => setEditForm((f) => ({ ...f, pan: e.target.value }))}
                  />
                </div>
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setEditingCompany(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
