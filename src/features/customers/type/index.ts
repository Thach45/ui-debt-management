export type CustomerTier = 'STANDARD' | 'REGULAR' | 'VIP'

/** Một hợp đồng trong response chi tiết khách (GET /customers/:id). */
export type CustomerContractSummary = {
  id: string
  productName?: string | null
  startDate: string
  endDate?: string | null
  principal: string | number
  totalInterest: string | number
  remainingAmount: string | number
  loanStatus?: string
}

export type CustomerRow = {
  id: string
  name: string
  phone: string
  address?: string | null
  farmingLocation?: string | null
  customerTier: CustomerTier
  lastPurchaseDate?: string | null
  totalCurrentDebt?: string | number | null
  lifetimePurchaseValue?: string | number | null
  createdAt?: string | null
  updatedAt?: string | null
  /** Tổng còn phải thu (tính theo công thức giống trang hợp đồng). */
  totalRemainingDebt?: string | number | null
  /** Tổng lãi dự kiến các hợp đồng. */
  totalExpectedInterest?: string | number | null
  contracts?: CustomerContractSummary[]
}

export type CustomerPayload = {
  name: string
  phone: string
  address?: string
  farmingLocation?: string
  customerTier?: CustomerTier
}
