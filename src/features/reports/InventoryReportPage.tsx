import { useQuery } from '@tanstack/react-query'
import { Boxes } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { EmptyState } from '@/components/EmptyState'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { fetchInventoryReport } from './reports.api'
import type { InventoryReportRow } from './reports.types'

export default function InventoryReportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: fetchInventoryReport,
  })

  const columns: DataTableColumn<InventoryReportRow>[] = [
    { key: 'name', header: 'Item', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'sku', header: 'SKU', render: (r) => r.sku },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (r) => (
        <span className={r.isLowStock ? 'text-destructive font-medium' : ''}>
          {r.currentStock} {r.unit}
        </span>
      ),
    },
    { key: 'minStock', header: 'Min Stock', align: 'right', render: (r) => r.minStock },
    { key: 'purchasePrice', header: 'Purchase Price', align: 'right', render: (r) => <MoneyDisplay paise={r.purchasePrice} /> },
    { key: 'sellingPrice', header: 'Selling Price', align: 'right', render: (r) => <MoneyDisplay paise={r.sellingPrice} /> },
    { key: 'stockValue', header: 'Stock Value', align: 'right', render: (r) => <MoneyDisplay paise={r.stockValue} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Inventory Report"
        description="Current stock levels and valuation across all items"
        actions={<ExportExcelButton reportType="inventory" filename="inventory-report.xlsx" />}
      />
      {!isLoading && data?.length === 0 ? (
        <EmptyState icon={Boxes} title="No items found" />
      ) : (
        <DataTable columns={columns} data={data ?? []} rowKey={(r) => r.itemId} isLoading={isLoading} />
      )}
    </div>
  )
}
