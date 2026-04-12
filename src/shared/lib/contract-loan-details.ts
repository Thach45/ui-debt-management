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

/** Làm tròn xuống tới đồng — khớp {@code RoundingMode.DOWN} scale 0 (Java). */
function roundMoneyDown(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.trunc(n)
}

/**
 * Giống {@code ContractLoanCalculator} backend — lãi %/tháng; tiền VND làm tròn <strong>xuống</strong> đồng nguyên.
 */
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
  let totalInterestRaw = 0

  const simple =
    contract.interestType === 'SIMPLE' ||
    contract.interestType === 'simple' ||
    String(contract.interestType).toUpperCase() === 'SIMPLE'

  if (simple) {
    const interestPerDayRaw = principal * (r / 30)
    totalInterestRaw = interestPerDayRaw * totalDays
  } else {
    const dailyRate = r / 30
    totalInterestRaw = principal * Math.pow(1 + dailyRate, totalDays) - principal
  }

  const totalInterest = roundMoneyDown(totalInterestRaw)
  const totalExpectedRaw = principal + totalInterestRaw
  const totalExpected = roundMoneyDown(totalExpectedRaw)

  const payments = contract.paymentRecords ?? []
  const totalPaidRaw = payments.reduce((sum, p) => sum + toNum(p.amount), 0)
  const totalPaid = roundMoneyDown(totalPaidRaw)

  const remainingRaw = Math.max(0, totalExpectedRaw - totalPaidRaw)
  const remainingAmount = roundMoneyDown(remainingRaw)

  const interestPerDay =
    totalDays > 0 ? roundMoneyDown(totalInterest / totalDays) : 0

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
