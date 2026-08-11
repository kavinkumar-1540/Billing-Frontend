import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Percent } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/EmptyState'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet'
import { fetchTaxRates, createTaxRate } from '@/features/items/items.api'
import type { TaxRate } from '@/features/items/items.types'

export default function TaxSettingsPage() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [ratePercent, setRatePercent] = useState('')
  const [cessPercent, setCessPercent] = useState('')
  const queryClient = useQueryClient()

  const { data: taxRates, isLoading } = useQuery({ queryKey: ['tax-rates'], queryFn: fetchTaxRates })

  const mutation = useMutation({
    mutationFn: () =>
      createTaxRate({
        name,
        ratePercent: Number(ratePercent),
        cessPercent: cessPercent ? Number(cessPercent) : undefined,
      }),
    onSuccess: () => {
      toast.success('Tax rate created')
      void queryClient.invalidateQueries({ queryKey: ['tax-rates'] })
      setOpen(false)
      setName('')
      setRatePercent('')
      setCessPercent('')
    },
    onError: () => toast.error('Failed to create tax rate'),
  })

  const columns: DataTableColumn<TaxRate>[] = [
    { key: 'name', header: 'Name', render: (t) => t.name },
    { key: 'rate', header: 'GST Rate', align: 'right', render: (t) => `${t.ratePercent}%` },
    { key: 'cess', header: 'Cess', align: 'right', render: (t) => `${t.cessPercent}%` },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <Badge variant={t.isActive ? 'success' : 'secondary'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="GST / Tax"
        description="Configure the GST rates used across items, invoices, and reports"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add Tax Rate
          </Button>
        }
      />

      {!isLoading && taxRates?.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="No tax rates configured"
          description="Add GST rates like 0%, 5%, 12%, 18%, 28% to use across your items and invoices."
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Add Tax Rate
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={taxRates ?? []} rowKey={(t) => t._id} isLoading={isLoading} />
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Tax Rate</SheetTitle>
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
                <Label htmlFor="taxName">Name *</Label>
                <Input
                  id="taxName"
                  required
                  placeholder="GST 18%"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ratePercent">GST rate (%) *</Label>
                <Input
                  id="ratePercent"
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={ratePercent}
                  onChange={(e) => setRatePercent(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cessPercent">Cess (%)</Label>
                <Input
                  id="cessPercent"
                  type="number"
                  min={0}
                  max={100}
                  value={cessPercent}
                  onChange={(e) => setCessPercent(e.target.value)}
                />
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Add Tax Rate'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}