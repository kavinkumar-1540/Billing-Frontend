import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Undo2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { ViewPdfButton } from '@/components/ViewPdfButton'
import { fetchCreditNotes } from './credit-notes.api'
import type { CreditNote } from './credit-notes.types'

export default function CreditNotesPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['credit-notes'],
    queryFn: () => fetchCreditNotes({ limit: 50 }),
  })

  const columns: DataTableColumn<CreditNote>[] = [
    { key: 'number', header: 'Note #', render: (n) => <span className="font-medium">{n.noteNumber}</span> },
    { key: 'date', header: 'Date', render: (n) => new Date(n.date).toLocaleDateString('en-IN') },
    { key: 'customer', header: 'Customer', render: (n) => n.customerSnapshot.name },
    { key: 'reason', header: 'Reason', render: (n) => n.reason },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (n) => <MoneyDisplay paise={n.taxSummary.grandTotal} />,
    },
    { key: 'status', header: 'Status', render: (n) => <StatusBadge status={n.status} /> },
    {
      key: 'pdf',
      header: '',
      align: 'right',
      render: (n) => <ViewPdfButton docType="credit-note" id={n._id} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Credit Notes"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/sales/credit-notes/new')}>
            <Plus className="size-4" />
            New Credit Note
          </Button>
        }
      />
      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={Undo2}
          title="No credit notes yet"
          description="Issue a credit note when goods are returned or an invoice needs correcting."
          action={
            <Button size="sm" onClick={() => navigate('/sales/credit-notes/new')}>
              New Credit Note
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={data?.items ?? []} rowKey={(n) => n._id} isLoading={isLoading} />
      )}
    </div>
  )
}
