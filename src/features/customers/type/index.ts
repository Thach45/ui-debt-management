export type CustomerTier = 'STANDARD' | 'REGULAR' | 'VIP'

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
}

export type CustomerPayload = {
  name: string
  phone: string
  address?: string
  farmingLocation?: string
  customerTier?: CustomerTier
}
