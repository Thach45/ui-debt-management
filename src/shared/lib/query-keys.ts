import type { QueryClient } from '@tanstack/react-query'

/** Root segments — dùng chung cho `useQuery` và `invalidateQueries` (prefix khớp mọi biến thể). */
export const QK = {
  contracts: ['contracts'] as const,
  dashboardStats: ['dashboard-stats'] as const,
  /** Prefix: mọi query `['contract', id]` */
  contract: ['contract'] as const,
  customers: ['customers'] as const,
  /** Prefix: `['customers-search', keyword]` */
  customersSearch: ['customers-search'] as const,
} as const

export function contractDetailQueryKey(id: string | undefined) {
  return ['contract', id] as const
}

export function customerDetailQueryKey(id: string | undefined) {
  return ['customer', id] as const
}

export function contractsPageQueryKey(page: number, size: number) {
  return [...QK.contracts, page, size] as const
}

export function customersSearchQueryKey(keyword: string) {
  return [...QK.customersSearch, keyword] as const
}

/**
 * Sau thao tác làm thay đổi hợp đồng / thu tiền: luôn refetch danh sách HĐ + dashboard.
 * Truyền `contractId` nếu cần refetch luôn cache chi tiết HĐ đang mở.
 */
export function invalidateContractPortfolio(
  qc: QueryClient,
  opts?: { contractId?: string | undefined },
) {
  void qc.invalidateQueries({ queryKey: QK.contracts })
  void qc.invalidateQueries({ queryKey: QK.dashboardStats })
  if (opts?.contractId) {
    void qc.invalidateQueries({ queryKey: contractDetailQueryKey(opts.contractId) })
  }
}

/** Khi có thể xóa / đổi hàng loạt HĐ (vd. xóa KH): xóa mọi cache chi tiết HĐ. */
export function invalidateAllContractDetails(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: QK.contract })
}

/** Danh sách + cache tìm kiếm KH + (tuỳ chọn) chi tiết KH. */
export function invalidateCustomerCaches(qc: QueryClient, opts?: { customerId?: string }) {
  void qc.invalidateQueries({ queryKey: QK.customers })
  void qc.invalidateQueries({ queryKey: QK.customersSearch })
  if (opts?.customerId) {
    void qc.invalidateQueries({ queryKey: customerDetailQueryKey(opts.customerId) })
  }
}

/** Tạo KH mới: danh sách + mọi query tìm kiếm (để danh chọn HĐ thấy KH mới). */
export function invalidateAfterCustomerCreate(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: QK.customers })
  void qc.invalidateQueries({ queryKey: QK.customersSearch })
}

/** Cập nhật KH: tên/SĐT trên list HĐ đổi → refetch danh sách HĐ (+ cache KH). */
export function invalidateCustomerAndRelatedLists(qc: QueryClient, customerId: string) {
  invalidateCustomerCaches(qc, { customerId })
  void qc.invalidateQueries({ queryKey: QK.contracts })
}

/**
 * Xóa KH: có thể xóa HĐ kèm theo → refetch HĐ, dashboard, mọi chi tiết HĐ, cache KH.
 */
export function invalidateAfterCustomerDelete(qc: QueryClient, customerId: string) {
  invalidateCustomerCaches(qc, { customerId })
  void qc.invalidateQueries({ queryKey: QK.contracts })
  void qc.invalidateQueries({ queryKey: QK.dashboardStats })
  invalidateAllContractDetails(qc)
}
