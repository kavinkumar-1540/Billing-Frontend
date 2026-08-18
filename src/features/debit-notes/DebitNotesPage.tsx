import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { ViewPdfButton } from '@/components/ViewPdfButton'
import { fetchDebitNotes } from './debit-notes.api'
import type { DebitNote } from './debit-notes.types'

export default function DebitNotesPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['debit-notes'],
    queryFn: () => fetchDebitNotes({ limit: 50 }),
  })

  const columns: DataTableColumn<DebitNote>[] = [
    { key: 'number', header: 'Note #', render: (n) => <span className="font-medium">{n.noteNumber}</span> },
    { key: 'date', header: 'Date', render: (n) => new Date(n.date).toLocaleDateString('en-IN') },
    { key: 'supplier', header: 'Supplier', render: (n) => n.supplierSnapshot.name },
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
      render: (n) => <ViewPdfButton docType="debit-note" id={n._id} title={n.noteNumber} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Debit Notes"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/purchases/debit-notes/new')}>
            <Plus className="size-4" />
            New Debit Note
          </Button>
        }
      />
      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No debit notes yet"
          description="Issue a debit note when returning goods to a supplier."
          action={
            <Button size="sm" onClick={() => navigate('/purchases/debit-notes/new')}>
              New Debit Note
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={data?.items ?? []} rowKey={(n) => n._id} isLoading={isLoading} />
      )}
    </div>
  )
}
