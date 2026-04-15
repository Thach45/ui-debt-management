/**
 * Khớp {@code DashboardOverviewDTO} — dùng khi nối API tổng quan (thay MOCK trên HomePage).
 */
export type DashboardOverview = {
  totalContracts: number
  activeCount: number
  overdueCount: number
  completedCount: number
  totalCollected: number
  totalRemaining: number
  /** Tổng lãi dự kiến (cộng từng HĐ) */
  totalInterest: number
  /** Tổng gốc thực cho vay (giá trị HĐ − trả trước) */
  totalPrincipalLent: number
}

/**
 * Khớp {@code ContractCountResponseDTO} — body <code>data</code> của
 * <code>GET /api/v1/contracts/count</code>.
 */
export type ContractCountResponse = {
  count: number
}
