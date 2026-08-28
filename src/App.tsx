import type { ComponentType } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { RequirePermission } from '@/features/auth/RequirePermission'
import LoginPage from '@/features/auth/LoginPage'
import ResetPasswordPage from '@/features/auth/ResetPasswordPage'
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

const BUILT_ROUTES: Record<string, { component: ComponentType; permission: string }> = {
  '/parties/customers': { component: CustomersPage, permission: 'parties:manage' },
  '/parties/suppliers': { component: SuppliersPage, permission: 'parties:manage' },
  '/inventory/items': { component: ItemsPage, permission: 'inventory:view' },
  '/inventory/adjustments': { component: StockAdjustmentsPage, permission: 'inventory:view' },
  '/sales/orders': { component: SalesOrdersPage, permission: 'sales:view' },
  '/sales/invoices': { component: SalesInvoicesPage, permission: 'sales:view' },
  '/purchases/orders': { component: PurchaseOrdersPage, permission: 'purchase:view' },
  '/purchases/bills': { component: PurchaseBillsPage, permission: 'purchase:view' },
  '/payments/receipts': { component: CustomerReceiptsPage, permission: 'payments:view' },
  '/payments/supplier-payments': { component: SupplierPaymentsPage, permission: 'payments:view' },
  '/sales/credit-notes': { component: CreditNotesPage, permission: 'sales:view' },
  '/purchases/debit-notes': { component: DebitNotesPage, permission: 'purchase:view' },
  '/purchases/bill-adjustments': { component: BillAdjustmentsPage, permission: 'purchase:view' },
  '/settings/tax': { component: TaxSettingsPage, permission: 'settings:manage' },
  '/settings/company': { component: CompanySettingsPage, permission: 'settings:manage' },
  '/settings/users': { component: UsersSettingsPage, permission: 'users:manage' },
  '/settings/roles': { component: RolesSettingsPage, permission: 'users:manage' },
  '/reports': { component: ReportsPage, permission: 'reports:view' },
}

const FORM_ROUTES: { path: string; component: ComponentType; permission: string }[] = [
  { path: '/sales/orders/new', component: SalesOrderFormPage, permission: 'sales:create' },
  { path: '/sales/invoices/new', component: SalesInvoiceFormPage, permission: 'sales:create' },
  { path: '/sales/invoices/:id', component: SalesInvoiceDetailPage, permission: 'sales:view' },
  { path: '/purchases/orders/new', component: PurchaseOrderFormPage, permission: 'purchase:create' },
  { path: '/purchases/bills/new', component: PurchaseBillFormPage, permission: 'purchase:create' },
  { path: '/sales/credit-notes/new', component: CreditNoteFormPage, permission: 'sales:create' },
  { path: '/purchases/debit-notes/new', component: DebitNoteFormPage, permission: 'purchase:create' },
]

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
                path="/reset-password"
                element={
                  <PublicOnlyRoute>
                    <ResetPasswordPage />
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
                {FORM_ROUTES.map(({ path, component: Component, permission }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <RequirePermission permission={permission}>
                        <Component />
                      </RequirePermission>
                    }
                  />
                ))}
                {Object.entries(BUILT_ROUTES).map(([path, { component: Component, permission }]) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <RequirePermission permission={permission}>
                        <Component />
                      </RequirePermission>
                    }
                  />
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