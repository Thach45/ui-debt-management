import { createBrowserRouter, Outlet } from 'react-router-dom'

import { RootLayout } from '@/app/layouts/RootLayout'
import { ContractNewPage } from '@/pages/contracts/ContractNewPage'
import { ContractsPage } from '@/pages/contracts/ContractsPage'
import { HomePage } from '@/pages/home/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
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
