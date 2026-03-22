import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { isAuthenticated } from '@/shared/lib/auth-storage'

type Props = { children: ReactNode }

export function ProtectedRoute({ children }: Props) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return children
}
