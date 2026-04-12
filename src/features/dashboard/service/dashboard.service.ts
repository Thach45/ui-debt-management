import { apiClient, unwrapResponseApi } from '@/shared/api/client'
import type { ResponseApi } from '@/shared/types/api'
import type { DashboardOverview } from '@/shared/types/dashboard'

export type DashboardOverviewApi = {
  totalContracts: number
  activeCount: number
  overdueCount: number
  completedCount: number
  totalCollected: number | string
  totalRemaining: number | string
  totalInterest?: number | string
  totalPrincipalLent?: number | string
}

function toNum(v: number | string): number {
  if (typeof v === 'number') return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export async function fetchDashboardStats(): Promise<DashboardOverview> {
  const res = await apiClient.get<ResponseApi<DashboardOverviewApi>>('/api/v1/dashboard/stats')
  const data = unwrapResponseApi(res.data)
  return {
    totalContracts: data.totalContracts,
    activeCount: data.activeCount,
    overdueCount: data.overdueCount,
    completedCount: data.completedCount,
    totalCollected: toNum(data.totalCollected),
    totalRemaining: toNum(data.totalRemaining),
    totalInterest: toNum(data.totalInterest ?? 0),
    totalPrincipalLent: toNum(data.totalPrincipalLent ?? 0),
  }
}
