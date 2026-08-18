import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, BookOpen, ChevronDown, Download, Printer, Search, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { MoneyDisplay } from '@/components/MoneyDisplay'
import { EmptyState } from '@/components/EmptyState'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchParties } from '@/features/parties/parties.api'
import {
  fetchCreditorsReport,
  fetchDebtorsReport,
  fetchGstRegisterReport,
  fetchLedgerReport,
  fetchMonthlyReport,
  fetchStockMovementReport,
} from './reports.api'
import type {
  GstTransactionRow,
  LedgerEntryRow,
  MonthlyReportRow,
  PartyLedgerBalanceRow,
  StockMovementReportRow,
} from './reports.types'

type ReportKey = 'monthly' | 'gst' | 'creditors' | 'ledgers' | 'stock-summary' | 'debtors'

const REPORT_OPTIONS: { key: ReportKey; label: string }[] = [
  { key: 'monthly', label: 'Monthly Report' },
  { key: 'gst', label: 'GST Report' },
  { key: 'creditors', label: 'Creditors' },
  { key: 'ledgers', label: 'Ledgers' },
  { key: 'stock-summary', label: 'Stock Summary' },
  { key: 'debtors', label: 'Debtors' },
]

function inr(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Serializes rows to CSV and triggers a browser download — no backend round-trip needed. */
function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

const GST_DOC_LABEL: Record<GstTransactionRow['type'], string> = {
  SALES_INVOICE: 'Sales (B2B)',
  PURCHASE_BILL: 'Purchase (Inward)',
  CREDIT_NOTE: 'Credit Note',
}

function gstRegisterColumns(): DataTableColumn<GstTransactionRow>[] {
  return [
    { key: 'date', header: 'Date', render: (r) => new Date(r.date).toLocaleDateString('en-IN') },
    { key: 'docNumber', header: 'Doc No', render: (r) => <span className="font-mono font-medium">{r.docNumber}</span> },
    { key: 'type', header: 'Type', render: (r) => <StatusBadge status={GST_DOC_LABEL[r.type]} /> },
    {
      key: 'party',
      header: 'Party / GSTIN',
      render: (r) => (
        <div>
          <div className="font-medium">{r.partyName}</div>
          {r.partyGstin && <div className="text-[10px] font-mono text-slate-500">{r.partyGstin}</div>}
        </div>
      ),
    },
    { key: 'pos', header: 'POS', render: (r) => r.placeOfSupply ?? '—' },
    { key: 'taxable', header: 'Taxable', align: 'right', render: (r) => <MoneyDisplay paise={r.taxableAmount} /> },
    { key: 'cgst', header: 'CGST', align: 'right', render: (r) => <MoneyDisplay paise={r.cgst} /> },
    { key: 'sgst', header: 'SGST', align: 'right', render: (r) => <MoneyDisplay paise={r.sgst} /> },
    { key: 'igst', header: 'IGST', align: 'right', render: (r) => <MoneyDisplay paise={r.igst} /> },
    { key: 'total', header: 'Total', align: 'right', render: (r) => <MoneyDisplay paise={r.total} className="font-semibold" /> },
  ]
}

const AGING_LABEL: Record<PartyLedgerBalanceRow['aging'], string> = {
  CURRENT: 'Current',
  '1-30': '1-30 days',
  '31-60': '31-60 days',
  '60+': '60+ days',
}

function partyLedgerColumns(kind: 'creditor' | 'debtor'): DataTableColumn<PartyLedgerBalanceRow>[] {
  const cols: DataTableColumn<PartyLedgerBalanceRow>[] = [
    { key: 'name', header: 'Party', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'gstin', header: 'GSTIN', render: (r) => r.gstin ?? '—' },
    { key: 'phone', header: 'Phone', render: (r) => r.phone ?? '—' },
    {
      key: 'totalBilled',
      header: kind === 'creditor' ? 'Total Purchases' : 'Total Billed',
      align: 'right',
      render: (r) => <MoneyDisplay paise={r.totalBilled} />,
    },
    {
      key: 'totalSettled',
      header: kind === 'creditor' ? 'Total Paid' : 'Received',
      align: 'right',
      render: (r) => <MoneyDisplay paise={r.totalSettled} />,
    },
  ]
  if (kind === 'debtor') {
    cols.push({
      key: 'creditLimit',
      header: 'Credit Limit',
      align: 'right',
      render: (r) => (r.creditLimit != null ? <MoneyDisplay paise={r.creditLimit} /> : '—'),
    })
  }
  cols.push(
    {
      key: 'outstanding',
      header: kind === 'creditor' ? 'Net Payable' : 'Outstanding',
      align: 'right',
      render: (r) => <MoneyDisplay paise={r.currentOutstanding} className="font-semibold" />,
    },
    { key: 'aging', header: 'Aging', render: (r) => AGING_LABEL[r.aging] },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  )
  return cols
}

function stockSummaryColumns(): DataTableColumn<StockMovementReportRow>[] {
  return [
    {
      key: 'name',
      header: 'Item',
      render: (r) => (
        <div>
          <div className="font-medium">{r.name}</div>
          <div className="text-[10px] text-slate-500">{r.category ?? '—'}</div>
        </div>
      ),
    },
    { key: 'sku', header: 'SKU', render: (r) => r.sku },
    { key: 'hsn', header: 'HSN', render: (r) => r.hsnSac ?? '—' },
    { key: 'opening', header: 'Opening', align: 'right', render: (r) => r.openingStock },
    { key: 'inward', header: 'Inward', align: 'right', render: (r) => <span className="text-emerald-400">{r.inward}</span> },
    { key: 'outward', header: 'Outward', align: 'right', render: (r) => <span className="text-rose-400">{r.outward}</span> },
    {
      key: 'closing',
      header: 'Closing Stock',
      align: 'right',
      render: (r) => (
        <span className={r.isLowStock ? 'text-destructive font-medium' : 'font-medium'}>
          {r.closingStock} {r.unit}
        </span>
      ),
    },
    { key: 'purchasePrice', header: 'Purchase Rate', align: 'right', render: (r) => <MoneyDisplay paise={r.purchasePrice} /> },
    { key: 'stockValue', header: 'Valuation', align: 'right', render: (r) => <MoneyDisplay paise={r.stockValue} /> },
  ]
}

const LEDGER_LABEL: Record<LedgerEntryRow['type'], string> = {
  SALES_INVOICE: 'Sales Invoice',
  PURCHASE_BILL: 'Purchase Bill',
  RECEIPT: 'Receipt',
  PAYMENT: 'Payment',
  CREDIT_NOTE: 'Credit Note',
  DEBIT_NOTE: 'Debit Note',
}

function ledgerColumns(): DataTableColumn<LedgerEntryRow>[] {
  return [
    { key: 'date', header: 'Date', render: (r) => new Date(r.date).toLocaleDateString('en-IN') },
    { key: 'voucherNumber', header: 'Voucher No', render: (r) => <span className="font-mono">{r.voucherNumber}</span> },
    { key: 'type', header: 'Type', render: (r) => <StatusBadge status={LEDGER_LABEL[r.type]} /> },
    { key: 'particulars', header: 'Particulars', render: (r) => r.particulars },
    { key: 'debit', header: 'Debit', align: 'right', render: (r) => (r.debit > 0 ? <MoneyDisplay paise={r.debit} /> : '—') },
    { key: 'credit', header: 'Credit', align: 'right', render: (r) => (r.credit > 0 ? <MoneyDisplay paise={r.credit} /> : '—') },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      render: (r) => (
        <span className={r.balance >= 0 ? 'font-semibold text-white' : 'font-semibold text-rose-400'}>
          <MoneyDisplay paise={Math.abs(r.balance)} /> {r.balance >= 0 ? 'Dr' : 'Cr'}
        </span>
      ),
    },
  ]
}

function StatCard({ label, value, tone, description }: { label: string; value: string; tone: string; description?: string }) {
  return (
    <Card className="p-5">
      <CardContent className="p-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`mt-2 text-xl font-extrabold tracking-tight ${tone}`}>{value}</p>
        {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
      </CardContent>
    </Card>
  )
}

function MonthlyReportSection({
  searchQuery,
  onDataChange,
}: {
  searchQuery: string
  onDataChange: (rows: MonthlyReportRow[]) => void
}) {
  const { data, isLoading } = useQuery({ queryKey: ['reports', 'monthly'], queryFn: fetchMonthlyReport })

  useEffect(() => {
    onDataChange(data ?? [])
  }, [data, onDataChange])

  const rows = useMemo(() => {
    const all = data ?? []
    if (!searchQuery) return all
    return all.filter((r) => r.monthName.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [data, searchQuery])

  const totals = useMemo(
    () =>
      (data ?? []).reduce(
        (acc, r) => ({
          invoicesCount: acc.invoicesCount + r.invoicesCount,
          taxableSales: acc.taxableSales + r.taxableSales,
          salesGst: acc.salesGst + r.salesGst,
          salesTotal: acc.salesTotal + r.salesTotal,
          purchaseTotal: acc.purchaseTotal + r.purchaseTotal,
          purchaseGst: acc.purchaseGst + r.purchaseGst,
          receiptsTotal: acc.receiptsTotal + r.receiptsTotal,
          paymentsTotal: acc.paymentsTotal + r.paymentsTotal,
          netCashFlow: acc.netCashFlow + r.netCashFlow,
        }),
        {
          invoicesCount: 0,
          taxableSales: 0,
          salesGst: 0,
          salesTotal: 0,
          purchaseTotal: 0,
          purchaseGst: 0,
          receiptsTotal: 0,
          paymentsTotal: 0,
          netCashFlow: 0,
        },
      ),
    [data],
  )

  const columns: DataTableColumn<MonthlyReportRow>[] = [
    { key: 'month', header: 'Month', render: (r) => <span className="font-medium">{r.monthName}</span> },
    { key: 'invoices', header: 'Invoices', align: 'right', render: (r) => r.invoicesCount },
    { key: 'taxableSales', header: 'Taxable Sales', align: 'right', render: (r) => <MoneyDisplay paise={r.taxableSales} /> },
    { key: 'salesGst', header: 'Sales GST', align: 'right', render: (r) => <MoneyDisplay paise={r.salesGst} className="text-amber-400" /> },
    { key: 'salesTotal', header: 'Total Sales', align: 'right', render: (r) => <MoneyDisplay paise={r.salesTotal} /> },
    { key: 'purchaseTotal', header: 'Purchases', align: 'right', render: (r) => <MoneyDisplay paise={r.purchaseTotal} /> },
    { key: 'receiptsTotal', header: 'Receipts', align: 'right', render: (r) => <MoneyDisplay paise={r.receiptsTotal} className="text-emerald-400" /> },
    {
      key: 'netCashFlow',
      header: 'Net Cash Flow',
      align: 'right',
      render: (r) => (
        <span className={r.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {r.netCashFlow >= 0 ? '+' : ''}
          <MoneyDisplay paise={r.netCashFlow} />
        </span>
      ),
    },
  ]

  if (!isLoading && (data ?? []).length === 0) {
    return <EmptyState icon={BarChart3} title="No monthly data yet" description="Issue sales invoices, purchase bills, or record payments to see monthly performance." />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Billed Revenue" value={inr(totals.salesTotal)} tone="text-white" description={`Across ${totals.invoicesCount} Total Invoices`} />
        <StatCard label="Total Purchases Cost" value={inr(totals.purchaseTotal)} tone="text-white" description="Inward Material Procurement" />
        <StatCard label="Net GST Output Tax" value={inr(totals.salesGst)} tone="text-amber-400" description={`Input Credit: ${inr(totals.purchaseGst)}`} />
        <StatCard label="Cash Inflows (Receipts)" value={inr(totals.receiptsTotal)} tone="text-emerald-400" description={`Disbursed: ${inr(totals.paymentsTotal)}`} />
      </div>

      <Card className="p-6">
        <CardHeader className="flex-row items-center justify-between space-y-0 p-0 pb-4">
          <CardTitle>Monthly Performance Breakdown</CardTitle>
          <span className="text-xs text-slate-400">{rows.length} Months Tracked</span>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={rows} rowKey={(r) => r.monthKey} isLoading={isLoading} />
          {rows.length > 0 && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-xs font-bold text-white">
              <span>TOTAL</span>
              <div className="flex gap-6 font-mono">
                <span><MoneyDisplay paise={totals.salesTotal} /></span>
                <span className={totals.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  <MoneyDisplay paise={totals.netCashFlow} />
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GstReportSection({ searchQuery }: { searchQuery: string }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'gst-register', from, to],
    queryFn: () => fetchGstRegisterReport({ from: from || undefined, to: to || undefined }),
  })

  const rows = useMemo(() => {
    const all = data ?? []
    if (!searchQuery) return all
    const q = searchQuery.toLowerCase()
    return all.filter((r) => r.partyName.toLowerCase().includes(q) || r.docNumber.toLowerCase().includes(q))
  }, [data, searchQuery])

  const totalTaxable = (data ?? []).reduce((sum, r) => sum + r.taxableAmount, 0)
  const totalTax = (data ?? []).reduce((sum, r) => sum + r.cgst + r.sgst + r.igst, 0)
  const totalGross = (data ?? []).reduce((sum, r) => sum + r.total, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Taxable Value (GSTR-1)" value={inr(totalTaxable)} tone="text-white" />
        <StatCard label="Total Output/Input Tax" value={inr(totalTax)} tone="text-amber-400" />
        <StatCard label="Total Invoiced Gross Value" value={inr(totalGross)} tone="text-white" description={`${data?.length ?? 0} records`} />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <ExportExcelButton reportType="gst" params={{ from: from || undefined, to: to || undefined }} filename="gst-report.xlsx" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">GSTR-1 &amp; 3B Transactions Register</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={gstRegisterColumns()}
            data={rows}
            rowKey={(r) => `${r.type}-${r.docNumber}`}
            isLoading={isLoading}
            emptyTitle="No GST transactions match your search"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function CreditorsSection({ searchQuery }: { searchQuery: string }) {
  const { data, isLoading } = useQuery({ queryKey: ['reports', 'creditors'], queryFn: fetchCreditorsReport })
  const rows = useMemo(
    () => (data ?? []).filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [data, searchQuery],
  )
  const totalPayable = (data ?? []).reduce((sum, r) => sum + r.currentOutstanding, 0)
  const totalPaid = (data ?? []).reduce((sum, r) => sum + r.totalSettled, 0)

  if (!isLoading && (data ?? []).length === 0) {
    return <EmptyState icon={Wallet} title="No creditors" description="You have no outstanding balances owed to suppliers." />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Sundry Creditors" value={String(data?.length ?? 0)} tone="text-white" />
        <StatCard label="Net Outstanding Payables" value={inr(totalPayable)} tone="text-rose-400" />
        <StatCard label="Total Payments Cleared" value={inr(totalPaid)} tone="text-emerald-400" />
      </div>
      <div className="flex justify-end">
        <ExportExcelButton reportType="creditors" filename="creditors-report.xlsx" />
      </div>
      <DataTable columns={partyLedgerColumns('creditor')} data={rows} rowKey={(r) => r.partyId} isLoading={isLoading} emptyTitle="No creditors match your search" />
    </div>
  )
}

function DebtorsSection({ searchQuery }: { searchQuery: string }) {
  const { data, isLoading } = useQuery({ queryKey: ['reports', 'debtors'], queryFn: fetchDebtorsReport })
  const rows = useMemo(
    () => (data ?? []).filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [data, searchQuery],
  )
  const totalReceivable = (data ?? []).reduce((sum, r) => sum + r.currentOutstanding, 0)
  const totalReceived = (data ?? []).reduce((sum, r) => sum + r.totalSettled, 0)

  if (!isLoading && (data ?? []).length === 0) {
    return <EmptyState icon={Wallet} title="No debtors" description="You have no outstanding balances owed by customers." />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Sundry Debtors" value={String(data?.length ?? 0)} tone="text-white" />
        <StatCard label="Total Accounts Receivable" value={inr(totalReceivable)} tone="text-amber-400" />
        <StatCard label="Total Receipts Collected" value={inr(totalReceived)} tone="text-emerald-400" />
      </div>
      <div className="flex justify-end">
        <ExportExcelButton reportType="debtors" filename="debtors-report.xlsx" />
      </div>
      <DataTable columns={partyLedgerColumns('debtor')} data={rows} rowKey={(r) => r.partyId} isLoading={isLoading} emptyTitle="No debtors match your search" />
    </div>
  )
}

function StockSummarySection({ searchQuery }: { searchQuery: string }) {
  const { data, isLoading } = useQuery({ queryKey: ['reports', 'stock-movement'], queryFn: fetchStockMovementReport })
  const rows = useMemo(
    () => (data ?? []).filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [data, searchQuery],
  )
  const totalValuation = (data ?? []).reduce((sum, r) => sum + r.stockValue, 0)
  const lowStockCount = (data ?? []).filter((r) => r.isLowStock).length

  if (!isLoading && (data ?? []).length === 0) {
    return <EmptyState title="No items found" />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Inventory Items" value={`${data?.length ?? 0} SKUs`} tone="text-white" />
        <StatCard label="Total Stock Valuation" value={inr(totalValuation)} tone="text-white" />
        <StatCard label="Low Stock Alerts" value={String(lowStockCount)} tone={lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'} />
      </div>
      <div className="flex justify-end">
        <ExportExcelButton reportType="inventory" filename="stock-summary.xlsx" />
      </div>
      <DataTable columns={stockSummaryColumns()} data={rows} rowKey={(r) => r.itemId} isLoading={isLoading} emptyTitle="No items match your search" />
    </div>
  )
}

function LedgersSection() {
  const [partyId, setPartyId] = useState('')
  const { data: customers } = useQuery({
    queryKey: ['parties', 'CUSTOMER', 'ledger-selector'],
    queryFn: () => fetchParties('CUSTOMER', { limit: 200 }),
  })
  const { data: suppliers } = useQuery({
    queryKey: ['parties', 'SUPPLIER', 'ledger-selector'],
    queryFn: () => fetchParties('SUPPLIER', { limit: 200 }),
  })
  const { data: entries, isLoading } = useQuery({
    queryKey: ['reports', 'ledger', partyId],
    queryFn: () => fetchLedgerReport(partyId),
    enabled: Boolean(partyId),
  })

  const totalDebit = (entries ?? []).reduce((sum, e) => sum + e.debit, 0)
  const totalCredit = (entries ?? []).reduce((sum, e) => sum + e.credit, 0)
  const closingBalance = entries && entries.length > 0 ? entries[entries.length - 1].balance : 0

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Filter by Party</label>
            <select
              className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
            >
              <option value="">Select a customer or supplier…</option>
              <optgroup label="Customers">
                {customers?.items.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Suppliers">
                {suppliers?.items.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </CardContent>
      </Card>

      {!partyId ? (
        <EmptyState icon={BookOpen} title="Select a party" description="Choose a customer or supplier above to view their full transaction ledger." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Debit Transactions" value={inr(totalDebit)} tone="text-white" />
            <StatCard label="Total Credit Transactions" value={inr(totalCredit)} tone="text-white" />
            <StatCard
              label="Closing Balance"
              value={`${inr(Math.abs(closingBalance))} ${closingBalance >= 0 ? 'Dr' : 'Cr'}`}
              tone={closingBalance >= 0 ? 'text-white' : 'text-rose-400'}
              description={`${entries?.length ?? 0} Ledger Postings`}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Party Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={ledgerColumns()}
                data={entries ?? []}
                rowKey={(r) => `${r.type}-${r.voucherNumber}-${r.date}`}
                isLoading={isLoading}
                emptyTitle="No transactions recorded for this party yet"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default function ReportsPage() {
  const [selected, setSelected] = useState<ReportKey>('monthly')
  const [searchQuery, setSearchQuery] = useState('')
  const [monthlyRows, setMonthlyRows] = useState<MonthlyReportRow[]>([])
  const activeOption = REPORT_OPTIONS.find((o) => o.key === selected)!

  function handleExportCsv() {
    if (selected !== 'monthly' || monthlyRows.length === 0) return
    downloadCsv(
      'monthly-report.csv',
      ['Month', 'Invoices', 'Taxable Sales', 'Sales GST', 'Total Sales', 'Purchases', 'Receipts', 'Net Cash Flow'],
      monthlyRows.map((r) => [
        r.monthName,
        r.invoicesCount,
        r.taxableSales / 100,
        r.salesGst / 100,
        r.salesTotal / 100,
        r.purchaseTotal / 100,
        r.receiptsTotal / 100,
        r.netCashFlow / 100,
      ]),
    )
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate, filter, and export comprehensive business, GST, ledger, and inventory reports."
        actions={
          <div className="flex items-center gap-2">
            {selected === 'monthly' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleExportCsv}
                disabled={monthlyRows.length === 0}
              >
                <Download className="size-3.5" />
                Export CSV
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="size-3.5" />
              Print Report
            </Button>
          </div>
        }
      />

      <Card className="mb-6 p-6">
        <CardContent className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Select Report</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between gap-1.5">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-cyan-400" />
                    {activeOption.label}
                  </span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                {REPORT_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.key} onSelect={() => setSelected(option.key)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Search</label>
            <div className="glass-input flex h-9 items-center gap-2 rounded-xl px-3">
              <Search className="size-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeOption.label}...`}
                className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-200">
                  Clear
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selected === 'monthly' && <MonthlyReportSection searchQuery={searchQuery} onDataChange={setMonthlyRows} />}
      {selected === 'gst' && <GstReportSection searchQuery={searchQuery} />}
      {selected === 'creditors' && <CreditorsSection searchQuery={searchQuery} />}
      {selected === 'ledgers' && <LedgersSection />}
      {selected === 'stock-summary' && <StockSummarySection searchQuery={searchQuery} />}
      {selected === 'debtors' && <DebtorsSection searchQuery={searchQuery} />}
    </div>
  )
}
