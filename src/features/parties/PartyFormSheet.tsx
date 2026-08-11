import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createParty, updateParty } from './parties.api'
import type { Party, PartyFormValues, PartyType } from './parties.types'

const INDIAN_STATES: { name: string; code: string }[] = [
  { name: 'Tamil Nadu', code: '33' },
  { name: 'Karnataka', code: '29' },
  { name: 'Kerala', code: '32' },
  { name: 'Maharashtra', code: '27' },
  { name: 'Delhi', code: '07' },
  { name: 'Gujarat', code: '24' },
  { name: 'Telangana', code: '36' },
  { name: 'West Bengal', code: '19' },
]

interface PartyFormSheetProps {
  partyType: Exclude<PartyType, 'BOTH'>
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Party | null
}

const emptyForm: PartyFormValues = {
  partyType: 'CUSTOMER',
  name: '',
}

export function PartyFormSheet({ partyType, open, onOpenChange, editing }: PartyFormSheetProps) {
  const [form, setForm] = useState<PartyFormValues>({ ...emptyForm, partyType })
  const queryClient = useQueryClient()
  const label = partyType === 'CUSTOMER' ? 'Customer' : 'Supplier'

  useEffect(() => {
    if (editing) {
      setForm({
        partyType,
        name: editing.name,
        businessName: editing.businessName,
        contactPerson: editing.contactPerson,
        phone: editing.phone,
        email: editing.email,
        gstin: editing.gstin,
        pan: editing.pan,
        state: editing.state,
        stateCode: editing.stateCode,
        placeOfSupply: editing.placeOfSupply,
        creditLimit: editing.creditLimit / 100,
        paymentTermsDays: editing.paymentTermsDays,
        openingBalance: editing.openingBalance / 100,
        notes: editing.notes,
      })
    } else if (open) {
      setForm({ ...emptyForm, partyType })
    }
  }, [editing, open, partyType])

  const mutation = useMutation({
    mutationFn: () =>
      editing ? updateParty(editing._id, form) : createParty({ ...form, partyType }),
    onSuccess: () => {
      toast.success(`${label} ${editing ? 'updated' : 'created'} successfully`)
      void queryClient.invalidateQueries({ queryKey: ['parties', partyType] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(`Failed to save ${label.toLowerCase()}`)
    },
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {editing ? `Edit ${label}` : `Add ${label}`}
          </SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <SheetBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={form.businessName ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={form.gstin ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  value={form.pan ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                value={form.stateCode ?? ''}
                onChange={(e) => {
                  const selected = INDIAN_STATES.find((s) => s.code === e.target.value)
                  setForm((f) => ({
                    ...f,
                    state: selected?.name,
                    stateCode: selected?.code,
                    placeOfSupply: selected?.name,
                  }))
                }}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="creditLimit">Credit limit (₹)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  min={0}
                  value={form.creditLimit ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, creditLimit: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paymentTermsDays">Payment terms (days)</Label>
                <Input
                  id="paymentTermsDays"
                  type="number"
                  min={0}
                  value={form.paymentTermsDays ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentTermsDays: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label htmlFor="openingBalance">Opening balance (₹)</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  value={form.openingBalance ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, openingBalance: Number(e.target.value) }))
                  }
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : editing ? 'Save changes' : `Add ${label}`}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}