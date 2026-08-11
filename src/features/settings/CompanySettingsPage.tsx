import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchCompanyProfile, updateCompanyProfile } from './company-settings.api'
import type { UpdateCompanyPayload } from './company-settings.types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function CompanySettingsPage() {
  const queryClient = useQueryClient()
  const { data: company, isLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: fetchCompanyProfile,
  })

  const [form, setForm] = useState<UpdateCompanyPayload>({})

  useEffect(() => {
    if (!company) return
    setForm({
      name: company.name,
      legalName: company.legalName,
      logoUrl: company.logoUrl,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
      gstin: company.gstin,
      pan: company.pan,
      cin: company.cin,
      financialYearStartMonth: company.financialYearStartMonth,
      currency: company.currency,
      taxRegistrationType: company.taxRegistrationType,
    })
  }, [company])

  const mutation = useMutation({
    mutationFn: () => updateCompanyProfile(form),
    onSuccess: () => {
      toast.success('Company profile updated')
      void queryClient.invalidateQueries({ queryKey: ['company-profile'] })
    },
    onError: () => toast.error('Failed to update company profile'),
  })

  if (isLoading || !company) {
    return <div className="text-sm text-muted-foreground">Loading…</div>
  }

  const setField = <K extends keyof UpdateCompanyPayload>(key: K, value: UpdateCompanyPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const setAddressField = (key: keyof NonNullable<UpdateCompanyPayload['address']>, value: string) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }))

  return (
    <div>
      <PageHeader
        title="Company Profile"
        description="Business identity, contact details, and tax registration used across invoices and reports"
        actions={
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        }
      />

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" required value={form.name ?? ''} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="legalName">Legal Name</Label>
              <Input id="legalName" value={form.legalName ?? ''} onChange={(e) => setField('legalName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone ?? ''} onChange={(e) => setField('phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email ?? ''} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={form.website ?? ''} onChange={(e) => setField('website', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" value={form.logoUrl ?? ''} onChange={(e) => setField('logoUrl', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="line1">Address Line 1</Label>
              <Input id="line1" value={form.address?.line1 ?? ''} onChange={(e) => setAddressField('line1', e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input id="line2" value={form.address?.line2 ?? ''} onChange={(e) => setAddressField('line2', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.address?.city ?? ''} onChange={(e) => setAddressField('city', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.address?.state ?? ''} onChange={(e) => setAddressField('state', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stateCode">State Code</Label>
              <Input id="stateCode" value={form.address?.stateCode ?? ''} onChange={(e) => setAddressField('stateCode', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" value={form.address?.pincode ?? ''} onChange={(e) => setAddressField('pincode', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.address?.country ?? ''} onChange={(e) => setAddressField('country', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax Registration</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input id="gstin" value={form.gstin ?? ''} onChange={(e) => setField('gstin', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pan">PAN</Label>
              <Input id="pan" value={form.pan ?? ''} onChange={(e) => setField('pan', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cin">CIN</Label>
              <Input id="cin" value={form.cin ?? ''} onChange={(e) => setField('cin', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxRegistrationType">Tax Registration Type</Label>
              <Input
                id="taxRegistrationType"
                value={form.taxRegistrationType ?? ''}
                onChange={(e) => setField('taxRegistrationType', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="financialYearStartMonth">Financial Year Starts</Label>
              <select
                id="financialYearStartMonth"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                value={form.financialYearStartMonth ?? 4}
                onChange={(e) => setField('financialYearStartMonth', Number(e.target.value))}
              >
                {MONTHS.map((label, idx) => (
                  <option key={label} value={idx + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={form.currency ?? ''} onChange={(e) => setField('currency', e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
