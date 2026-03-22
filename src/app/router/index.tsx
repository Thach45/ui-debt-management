import { createBrowserRouter, Outlet } from 'react-router-dom'

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { RootLayout } from '@/app/layouts/RootLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ContractNewPage } from '@/pages/contracts/ContractNewPage'
import { ContractsPage } from '@/pages/contracts/ContractsPage'
import { HomePage } from '@/pages/home/HomePage'

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
      { index: true, element: <HomePage /> },
      {
        path: 'contracts',
        element: <Outlet />,
        children: [
          { index: true, element: <ContractsPage /> },
          { path: 'new', element: <ContractNewPage /> },
        ],
      },
    ],
  },
])
