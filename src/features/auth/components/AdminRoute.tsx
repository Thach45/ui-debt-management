import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { isAuthenticated } from '@/shared/lib/auth-storage'
import { isAdminRole } from '@/shared/lib/auth-role'

type Props = { children: ReactNode }

/** Chỉ ADMIN — nhân viên bị chuyển về `/contracts`. */
export function AdminRoute({ children }: Props) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (!isAdminRole()) {
    return <Navigate replace to="/contracts" />
  }

  return children
}
