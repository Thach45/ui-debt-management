import type { CustomerTier } from '@/features/customers/type'

const LABEL: Record<CustomerTier, string> = {
  STANDARD: 'Tiêu chuẩn',
  REGULAR: 'Thân thiết',
  VIP: 'VIP',
}

const STYLE: Record<CustomerTier, string> = {
  STANDARD: 'bg-gray-100 text-gray-700',
  REGULAR: 'bg-blue-100 text-blue-800',
  VIP: 'bg-amber-100 text-amber-900',
}

type Props = { tier: string }

function normalizeTier(tier: string): CustomerTier {
  if (tier === 'STANDARD' || tier === 'REGULAR' || tier === 'VIP') return tier
  return 'STANDARD'
}

export function CustomerTierBadge({ tier }: Props) {
  const t = normalizeTier(tier)
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium leading-tight ${STYLE[t]}`}
    >
      {LABEL[t]}
    </span>
  )
}
