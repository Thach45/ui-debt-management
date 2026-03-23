import type { ContractDetail } from '@/features/contracts/type'

function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  return typeof v === 'number' ? v : Number(v) || 0
}

function parseLocalDate(iso: string): Date {
  const day = iso.split('T')[0]
  const parts = day.split('-').map(Number)
  if (parts.length === 3 && !parts.some(Number.isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

/** Giống `calculateLoanDetails` trong remix `utils/calculations.ts` — lãi %/tháng (vd. 1.5). */
export function calculateLoanDetailsFromContract(contract: ContractDetail) {
  const principal = toNum(contract.principal)
  const start = parseLocalDate(contract.startDate)
  start.setHours(0, 0, 0, 0)
  const end = parseLocalDate(contract.endDate)
  end.setHours(0, 0, 0, 0)

  const diffTime = end.getTime() - start.getTime()
  let totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  if (totalDays < 0) totalDays = 0

  const ratePct = toNum(contract.interestRate)
  const r = ratePct / 100
  let totalInterest = 0
  let interestPerDay = 0

  const simple =
    contract.interestType === 'SIMPLE' ||
    contract.interestType === 'simple' ||
    String(contract.interestType).toUpperCase() === 'SIMPLE'

  if (simple) {
    interestPerDay = principal * (r / 30)
    totalInterest = interestPerDay * totalDays
  } else {
    const dailyRate = r / 30
    totalInterest = principal * Math.pow(1 + dailyRate, totalDays) - principal
    interestPerDay = totalDays > 0 ? totalInterest / totalDays : 0
  }

  const payments = contract.paymentRecords ?? []
  const totalPaid = payments.reduce((sum, p) => sum + toNum(p.amount), 0)

  const totalExpected = principal + totalInterest
  const remainingAmount = totalExpected - totalPaid

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue = today > end && remainingAmount > 0
  const isCompleted = remainingAmount <= 0

  let status: 'active' | 'overdue' | 'completed' = 'active'
  if (isCompleted) status = 'completed'
  else if (isOverdue) status = 'overdue'

  return {
    totalDays,
    interestPerDay,
    totalInterest,
    totalExpected,
    totalPaid,
    remainingAmount,
    status,
  }
}

export function contractProductLabel(contract: ContractDetail): string {
  const items = contract.items ?? []
  if (items.length === 0) return '—'
  return items.map((i) => i.productName).join(' · ')
}
