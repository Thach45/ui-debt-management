import { useQuery } from '@tanstack/react-query'

import { fetchDashboardStats } from '@/features/dashboard/service/dashboard.service'
import { QK } from '@/shared/lib/query-keys'

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: QK.dashboardStats,
    queryFn: fetchDashboardStats,
  })
}
