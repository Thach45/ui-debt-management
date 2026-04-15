import { Navigate } from 'react-router-dom'

import { HomePage } from '@/pages/home/HomePage'
import { isAdminRole } from '@/shared/lib/auth-role'

/** Trang chủ: ADMIN xem dashboard; STAFF về hợp đồng. */
export function DefaultHomeRoute() {
  if (isAdminRole()) {
    return <HomePage />
  }
  return <Navigate replace to="/contracts" />
}
