import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, History } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchAuditLogs } from './audit.api'
import type { AuditLogListItem } from './audit.types'

export default function AuditLogsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AuditLogListItem | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', from, to, entity, action, page],
    queryFn: () =>
      fetchAuditLogs({
        from: from || undefined,
        to: to || undefined,
        entity: entity || undefined,
        action: action || undefined,
        page,
        limit: 25,
      }),
  })

  const columns: DataTableColumn<AuditLogListItem>[] = [
    { key: 'date', header: 'Date', render: (r) => new Date(r.createdAt).toLocaleString('en-IN') },
    { key: 'action', header: 'Action', render: (r) => r.action },
    { key: 'entity', header: 'Entity', render: (r) => r.entity },
    { key: 'user', header: 'User', render: (r) => r.userName ?? '—' },
    { key: 'ip', header: 'IP Address', render: (r) => r.ipAddress ?? '—' },
  ]

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Full history of who changed what, across every module"
        actions={
          <ExportExcelButton reportType="audit" params={{ from: from || undefined, to: to || undefined }} filename="audit-log.xlsx" />
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <div className="space-y-1.5">
          <Label htmlFor="entity-filter">Entity</Label>
          <Input
            id="entity-filter"
            placeholder="e.g. SalesInvoice"
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value)
              setPage(1)
            }}
            className="w-48"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="action-filter">Action</Label>
          <Input
            id="action-filter"
            placeholder="e.g. INVOICE_ISSUED"
            value={action}
            onChange={(e) => {
              setAction(e.target.value)
              setPage(1)
            }}
            className="w-48"
          />
        </div>
      </div>

      {!isLoading && data?.items.length === 0 ? (
        <EmptyState icon={History} title="No audit entries match these filters" />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            rowKey={(r) => r._id}
            isLoading={isLoading}
            onRowClick={(r) => setSelected(r)}
          />
          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {data.page} of {data.totalPages} · {data.total} entries
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected?.action} · {selected?.entity}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 p-6 pt-0 text-sm">
              <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                <div>
                  <div className="text-xs uppercase">Date</div>
                  <div>{new Date(selected.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-xs uppercase">User</div>
                  <div>{selected.userName ?? '—'}</div>
                </div>
              </div>
              {selected.before && (
                <div>
                  <div className="mb-1 text-xs uppercase text-muted-foreground">Before</div>
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(selected.before, null, 2)}
                  </pre>
                </div>
              )}
              {selected.after && (
                <div>
                  <div className="mb-1 text-xs uppercase text-muted-foreground">After</div>
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(selected.after, null, 2)}
                  </pre>
                </div>
              )}
              {selected.metadata && (
                <div>
                  <div className="mb-1 text-xs uppercase text-muted-foreground">Metadata</div>
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
