import type { ComponentType } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import LoginPage from '@/features/auth/LoginPage'
import { AppShell } from '@/layouts/AppShell'
import DashboardPage from '@/features/dashboard/DashboardPage'
import CustomersPage from '@/features/customers/CustomersPage'
import SuppliersPage from '@/features/suppliers/SuppliersPage'
import ItemsPage from '@/features/items/ItemsPage'
import StockAdjustmentsPage from '@/features/inventory/StockAdjustmentsPage'
import SalesOrdersPage from '@/features/sales-orders/SalesOrdersPage'
import SalesOrderFormPage from '@/features/sales-orders/SalesOrderFormPage'
import SalesInvoicesPage from '@/features/sales-invoices/SalesInvoicesPage'
import SalesInvoiceFormPage from '@/features/sales-invoices/SalesInvoiceFormPage'
import SalesInvoiceDetailPage from '@/features/sales-invoices/SalesInvoiceDetailPage'
import PurchaseOrdersPage from '@/features/purchase-orders/PurchaseOrdersPage'
import PurchaseOrderFormPage from '@/features/purchase-orders/PurchaseOrderFormPage'
import PurchaseBillsPage from '@/features/purchase-bills/PurchaseBillsPage'
import PurchaseBillFormPage from '@/features/purchase-bills/PurchaseBillFormPage'
import CustomerReceiptsPage from '@/features/payments/CustomerReceiptsPage'
import SupplierPaymentsPage from '@/features/payments/SupplierPaymentsPage'
import CreditNotesPage from '@/features/credit-notes/CreditNotesPage'
import CreditNoteFormPage from '@/features/credit-notes/CreditNoteFormPage'
import DebitNotesPage from '@/features/debit-notes/DebitNotesPage'
import DebitNoteFormPage from '@/features/debit-notes/DebitNoteFormPage'
import BillAdjustmentsPage from '@/features/bill-adjustments/BillAdjustmentsPage'
import TaxSettingsPage from '@/features/settings/TaxSettingsPage'
import CompanySettingsPage from '@/features/settings/CompanySettingsPage'
import UsersSettingsPage from '@/features/settings/UsersSettingsPage'
import RolesSettingsPage from '@/features/settings/RolesSettingsPage'
import ReportsPage from '@/features/reports/ReportsPage'
import CompaniesPage from '@/features/companies/CompaniesPage'
import PlatformUsersPage from '@/features/platform-users/PlatformUsersPage'
import { ModulePlaceholderPage } from '@/components/ModulePlaceholderPage'
import { NAV } from '@/layouts/nav-config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

const BUILT_ROUTES: Record<string, ComponentType> = {
  '/parties/customers': CustomersPage,
  '/parties/suppliers': SuppliersPage,
  '/inventory/items': ItemsPage,
  '/inventory/adjustments': StockAdjustmentsPage,
  '/sales/orders': SalesOrdersPage,
  '/sales/invoices': SalesInvoicesPage,
  '/purchases/orders': PurchaseOrdersPage,
  '/purchases/bills': PurchaseBillsPage,
  '/payments/receipts': CustomerReceiptsPage,
  '/payments/supplier-payments': SupplierPaymentsPage,
  '/sales/credit-notes': CreditNotesPage,
  '/purchases/debit-notes': DebitNotesPage,
  '/purchases/bill-adjustments': BillAdjustmentsPage,
  '/settings/tax': TaxSettingsPage,
  '/settings/company': CompanySettingsPage,
  '/settings/users': UsersSettingsPage,
  '/settings/roles': RolesSettingsPage,
  '/reports': ReportsPage,
}

const placeholderRoutes = NAV.flatMap((group) =>
  group.sections.flatMap((section) =>
    section.items
      .filter((item) => item.to !== '/' && !BUILT_ROUTES[item.to])
      .map((item) => item),
  ),
)

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/platform-users" element={<PlatformUsersPage />} />
                <Route path="/sales/orders/new" element={<SalesOrderFormPage />} />
                <Route path="/sales/invoices/new" element={<SalesInvoiceFormPage />} />
                <Route path="/sales/invoices/:id" element={<SalesInvoiceDetailPage />} />
                <Route path="/purchases/orders/new" element={<PurchaseOrderFormPage />} />
                <Route path="/purchases/bills/new" element={<PurchaseBillFormPage />} />
                <Route path="/sales/credit-notes/new" element={<CreditNoteFormPage />} />
                <Route path="/purchases/debit-notes/new" element={<DebitNoteFormPage />} />
                {Object.entries(BUILT_ROUTES).map(([path, Component]) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
                {placeholderRoutes.map((item) => (
                  <Route
                    key={item.to}
                    path={item.to}
                    element={<ModulePlaceholderPage title={item.label} />}
                  />
                ))}
                <Route path="*" element={<ModulePlaceholderPage title="Page not found" />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App