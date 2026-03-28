import { useQuery } from '@tanstack/react-query'

import { fetchDashboardStats } from '@/features/dashboard/service/dashboard.service'

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })
}
