import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Plus, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/EmptyState'
import { Users } from 'lucide-react'
import { fetchParties, deactivateParty } from './parties.api'
import { PartyFormSheet } from './PartyFormSheet'
import type { Party, PartyType } from './parties.types'

interface PartyListPageProps {
  partyType: Exclude<PartyType, 'BOTH'>
  title: string
}

export function PartyListPage({ partyType, title }: PartyListPageProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Party | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['parties', partyType, debouncedSearch],
    queryFn: () => fetchParties(partyType, { search: debouncedSearch || undefined }),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateParty,
    onSuccess: () => {
      toast.success(`${title.slice(0, -1)} deactivated`)
      void queryClient.invalidateQueries({ queryKey: ['parties', partyType] })
    },
  })

  const columns: DataTableColumn<Party>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (p) => (
        <div>
          <div className="font-medium">{p.name}</div>
          {p.businessName && p.businessName !== p.name && (
            <div className="text-xs text-muted-foreground">{p.businessName}</div>
          )}
        </div>
      ),
    },
    { key: 'gstin', header: 'GSTIN', render: (p) => p.gstin ?? '—' },
    { key: 'state', header: 'State', render: (p) => p.state ?? '—' },
    { key: 'phone', header: 'Phone', render: (p) => p.phone ?? '—' },
    {
      key: 'outstanding',
      header: 'Outstanding',
      align: 'right',
      render: (p) => <MoneyDisplay paise={p.currentOutstanding} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge variant={p.isActive ? 'success' : 'secondary'}>
          {p.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setEditing(p)
                setSheetOpen(true)
              }}
            >
              Edit
            </DropdownMenuItem>
            {p.isActive && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  deactivateMutation.mutate(p._id)
                }}
              >
                Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={title}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditing(null)
              setSheetOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add {title.slice(0, -1)}
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}…`} />
      </div>

      {!isLoading && data?.items.length === 0 && !debouncedSearch ? (
        <EmptyState
          icon={Users}
          title={`No ${title.toLowerCase()} yet`}
          description={`Add your first ${title.toLowerCase().slice(0, -1)} to start creating documents against them.`}
          action={
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              Add {title.slice(0, -1)}
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          rowKey={(p) => p._id}
          isLoading={isLoading}
          emptyTitle={`No ${title.toLowerCase()} match your search`}
          onRowClick={(p) => {
            setEditing(p)
            setSheetOpen(true)
          }}
        />
      )}

      <PartyFormSheet
        partyType={partyType}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
      />
    </div>
  )
}