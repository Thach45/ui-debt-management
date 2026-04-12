import { createBrowserRouter, Outlet } from 'react-router-dom'

import { AdminRoute } from '@/features/auth/components/AdminRoute'
import { DefaultHomeRoute } from '@/features/auth/components/DefaultHomeRoute'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { RootLayout } from '@/app/layouts/RootLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ContractDetailPage } from '@/pages/contracts/ContractDetailPage'
import { ContractNewPage } from '@/pages/contracts/ContractNewPage'
import { ContractsPage } from '@/pages/contracts/ContractsPage'
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage'
import { CustomerFormPage } from '@/pages/customers/CustomerFormPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { UserAccountsPage } from '@/pages/accounts/UserAccountsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DefaultHomeRoute /> },
      {
        path: 'accounts',
        element: (
          <AdminRoute>
            <UserAccountsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'contracts',
        element: <Outlet />,
        children: [
          { index: true, element: <ContractsPage /> },
          { path: 'new', element: <ContractNewPage /> },
          { path: ':id', element: <ContractDetailPage /> },
        ],
      },
      {
        path: 'customers',
        element: <Outlet />,
        children: [
          { index: true, element: <CustomersPage /> },
          { path: 'new', element: <CustomerFormPage /> },
          { path: ':id/edit', element: <CustomerFormPage /> },
          { path: ':id', element: <CustomerDetailPage /> },
        ],
      },
    ],
  },
])
