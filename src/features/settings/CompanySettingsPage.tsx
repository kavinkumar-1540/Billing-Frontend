import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { fetchCompanyProfile, updateCompanyProfile } from './company-settings.api'
import type { UpdateCompanyPayload } from './company-settings.types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'tax', label: 'GST & Tax' },
  { key: 'bank', label: 'Bank & Payment' },
  { key: 'invoice', label: 'Invoice Branding' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function CompanySettingsPage() {
  const queryClient = useQueryClient()
  const { data: company, isLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: fetchCompanyProfile,
  })

  const [tab, setTab] = useState<TabKey>('general')
  const [form, setForm] = useState<UpdateCompanyPayload>({})

  useEffect(() => {
    if (!company) return
    setForm({
      name: company.name,
      legalName: company.legalName,
      tradeName: company.tradeName,
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
      bankDetails: company.bankDetails,
      invoiceBranding: company.invoiceBranding,
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

  const setBankField = (key: keyof NonNullable<UpdateCompanyPayload['bankDetails']>, value: string) =>
    setForm((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, [key]: value } }))

  const setInvoiceField = <K extends keyof NonNullable<UpdateCompanyPayload['invoiceBranding']>>(
    key: K,
    value: NonNullable<UpdateCompanyPayload['invoiceBranding']>[K],
  ) => setForm((prev) => ({ ...prev, invoiceBranding: { ...prev.invoiceBranding, [key]: value } }))

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

      <div className="glass-2 mb-6 flex w-fit items-center gap-1 rounded-xl border border-white/10 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? 'whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1.5 text-xs font-medium text-white shadow-md'
                : 'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        {tab === 'general' && (
          <div className="space-y-6">
            <Card className="p-6">
              <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input id="name" required value={form.name ?? ''} onChange={(e) => setField('name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="legalName">Legal Name</Label>
                  <Input id="legalName" value={form.legalName ?? ''} onChange={(e) => setField('legalName', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tradeName">Trade Name / DBA</Label>
                  <Input id="tradeName" value={form.tradeName ?? ''} onChange={(e) => setField('tradeName', e.target.value)} />
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

            <Card className="p-6">
              <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2">
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

            <Card className="p-6">
              <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="financialYearStartMonth">Financial Year Starts</Label>
                  <select
                    id="financialYearStartMonth"
                    className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
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
          </div>
        )}

        {tab === 'tax' && (
          <Card className="p-6">
            <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2">
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
                <Label htmlFor="taxRegistrationType">Tax Registration Scheme</Label>
                <select
                  id="taxRegistrationType"
                  className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
                  value={form.taxRegistrationType ?? 'Regular'}
                  onChange={(e) => setField('taxRegistrationType', e.target.value)}
                >
                  <option value="Regular">Regular Taxpayer (Standard CGST/SGST/IGST)</option>
                  <option value="Composition">Composition Scheme</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'bank' && (
          <Card className="p-6">
            <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" value={form.bankDetails?.bankName ?? ''} onChange={(e) => setBankField('bankName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input id="branchName" value={form.bankDetails?.branchName ?? ''} onChange={(e) => setBankField('branchName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" value={form.bankDetails?.accountNumber ?? ''} onChange={(e) => setBankField('accountNumber', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" value={form.bankDetails?.ifscCode ?? ''} onChange={(e) => setBankField('ifscCode', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input id="upiId" value={form.bankDetails?.upiId ?? ''} onChange={(e) => setBankField('upiId', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'invoice' && (
          <Card className="p-6">
            <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={form.invoiceBranding?.invoicePrefix ?? ''}
                  onChange={(e) => setInvoiceField('invoicePrefix', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="defaultPaymentTermDays">Default Payment Terms (Days)</Label>
                <Input
                  id="defaultPaymentTermDays"
                  type="number"
                  min={0}
                  value={form.invoiceBranding?.defaultPaymentTermDays ?? ''}
                  onChange={(e) => setInvoiceField('defaultPaymentTermDays', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="termsAndConditions">Standard Terms &amp; Conditions</Label>
                <textarea
                  id="termsAndConditions"
                  rows={5}
                  className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                  value={form.invoiceBranding?.termsAndConditions ?? ''}
                  onChange={(e) => setInvoiceField('termsAndConditions', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
