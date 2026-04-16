import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle,
  FileText,
  Package,
  Phone,
  Plus,
  Receipt,
  Share2,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react'

import { collectPayment, deleteContract } from '@/features/contracts/service'
import { useContractDetailQuery } from '@/features/contracts/hooks'
import type { ContractDetail } from '@/features/contracts/type'
import { contractProductLabel } from '@/shared/lib/contract-loan-details'
import { formatDate, formatVnd } from '@/shared/lib/format'
import { isAdminRole } from '@/shared/lib/auth-role'
import { invalidateContractPortfolio } from '@/shared/lib/query-keys'
import { toast } from '@/shared/lib/notify'

function formatPaymentDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return formatDate(iso)
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}

function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  return typeof v === 'number' ? v : Number(v) || 0
}

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: c, isPending, isError, error } = useContractDetailQuery(id)

  const [showCopied, setShowCopied] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payNote, setPayNote] = useState('')

  /** Không đặt tên `details` — trong .tsx dễ trùng JSX `<details>` khiến IDE/TS báo lỗi giả. */
  const contractFinance = useMemo(() => {
    if (!c) return null
    return {
      totalDays: c.totalDays ?? 0,
      interestPerDay: toNum(c.interestPerDay),
      totalInterest: toNum(c.totalInterest),
      totalExpected: toNum(c.totalExpected),
      totalPaid: toNum(c.totalPaid),
      remainingAmount: toNum(c.remainingAmount),
      repaymentUiStatus: String(c.loanStatus ?? 'active').toLowerCase(),
    }
  }, [c])

  const deleteMut = useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      toast.success('Đã xóa hợp đồng')
      invalidateContractPortfolio(qc, { contractId: id })
      navigate('/contracts', { replace: true })
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Không xóa được hợp đồng')
    },
  })

  const paymentMut = useMutation({
    mutationFn: collectPayment,
    onSuccess: () => {
      toast.success('Đã ghi nhận thu tiền')
      invalidateContractPortfolio(qc, { contractId: id })
      setPayAmount('')
      setPayNote('')
     
      setShowPaymentForm(false)
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Thu tiền thất bại'),
  })

  function handleShare(contract: ContractDetail, d: NonNullable<typeof contractFinance>) {
    const productLine = contractProductLabel(contract)
    const text = `HỢP ĐỒNG TRẢ GÓP
Khách hàng: ${contract.customerName}
Hàng hóa: ${productLine}
Nợ gốc: ${formatVnd(contract.principal)}
Thời gian: Từ ${formatDate(contract.startDate)} đến ${formatDate(contract.endDate)} (${d.totalDays} ngày)
Tiền lãi/ngày: ${formatVnd(d.interestPerDay)}
Tổng tiền lãi: ${formatVnd(d.totalInterest)}
Tổng phải thanh toán: ${formatVnd(d.totalExpected)}
Đã thanh toán: ${formatVnd(d.totalPaid)}
Còn lại: ${formatVnd(d.remainingAmount)}
`
    void navigator.clipboard.writeText(text)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  function handleAddPaymentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!c?.id || !contractFinance) return
    const raw = payAmount.replace(/\D/g, '')
    const amount = Number(raw)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Nhập số tiền hợp lệ (> 0)')
      return
    }
    if (amount > contractFinance.remainingAmount) {
      toast.error(`Số tiền vượt mức còn phải thu (${formatVnd(contractFinance.remainingAmount)})`)
      return
    }
    
    paymentMut.mutate({
      contractId: c.id,
      amount,
      note: payNote.trim() || null,
    
    })
  }

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50/50 text-sm text-slate-500">
        Đang tải hợp đồng…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-rose-600">{error instanceof Error ? error.message : 'Không tải được hợp đồng'}</p>
        <Link className="mt-4 inline-block text-sm font-medium text-teal-600 hover:underline" to="/contracts">
          Về danh sách hợp đồng
        </Link>
      </div>
    )
  }

  if (!c || !contractFinance) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-rose-600">Không tải được hợp đồng</p>
        <Link className="mt-4 inline-block text-sm font-medium text-teal-600 hover:underline" to="/contracts">
          Về danh sách hợp đồng
        </Link>
      </div>
    )
  }

  const productLine = contractProductLabel(c)
  const payments = c.paymentRecords ?? []
  const canPay =
    contractFinance.remainingAmount > 0 &&
    contractFinance.repaymentUiStatus !== 'completed' &&
    String(c.status).toUpperCase() !== 'COMPLETED'

  const apiStatus = String(c.status).toUpperCase()
  const canDeleteContract =
    apiStatus === 'COMPLETED' ||
    apiStatus === 'CANCELLED' ||
    contractFinance.repaymentUiStatus === 'completed'
  const isAdmin = isAdminRole()

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <div className="sticky top-0 z-10 mb-6 border-b border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            to="/contracts"
            className="group flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <div className="flex rounded-md bg-slate-100 p-1.5 transition-colors group-hover:bg-slate-200">
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
            </div>
            <span>Quay lại danh sách</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleShare(c, contractFinance)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {showCopied ? <CheckCircle className="size-4 text-teal-500" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
              <span>{showCopied ? 'Đã copy' : 'Copy gửi Zalo'}</span>
            </button>
            {isAdmin ? (
              <button
                type="button"
                disabled={deleteMut.isPending || !canDeleteContract}
                title={
                  canDeleteContract
                    ? undefined
                    : 'Chỉ xóa được khi hợp đồng đã tất toán hoặc đã hủy (còn nợ thì không xóa).'
                }
                onClick={() => {
                  if (
                    window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này? Mọi dữ liệu thu tiền sẽ bị mất.')
                  ) {
                    deleteMut.mutate(c.id)
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="hidden sm:inline">Xóa hợp đồng</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-6 sm:flex-row">
                <div className="flex items-start gap-5">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-600 shadow-inner">
                    <User className="size-8" aria-hidden />
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{c.customerName}</h1>
                      {contractFinance.repaymentUiStatus === 'overdue' ? (
                        <span className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                          <AlertCircle className="size-3.5" aria-hidden /> Quá hạn
                        </span>
                      ) : contractFinance.repaymentUiStatus === 'completed' ? (
                        <span className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                          <CheckCircle className="size-3.5" aria-hidden /> Đã tất toán
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          <CheckCircle className="size-3.5" aria-hidden /> Đang vay
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 text-sm font-medium text-slate-600 sm:flex-row sm:gap-6">
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-slate-400" aria-hidden />
                        {c.customerPhone}
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <Package className="size-4 shrink-0 text-slate-400" aria-hidden />
                        <span className="max-w-[220px] truncate">{productLine}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
                  <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <span>Kỳ hạn {contractFinance.totalDays} ngày</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 font-semibold text-slate-900">
                    {formatDate(c.startDate)} <span className="mx-1 text-slate-400">→</span> {formatDate(c.endDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Gốc ban đầu</p>
                <p className="text-xl font-bold text-slate-900">{formatVnd(c.principal)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Gốc còn lại</p>
                <p className="text-xl font-bold text-slate-900">{formatVnd(c.remainingPrincipal ?? 0)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Lãi còn lại</p>
                <p className="text-xl font-bold text-amber-600">{formatVnd(c.remainingInterest ?? 0)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Lãi suất / tháng</p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-xl font-bold text-slate-900">{String(c.interestRate)}%</p>
                  <p className="text-sm font-medium text-slate-500">({formatVnd(contractFinance.interestPerDay)}/ngày)</p>
                </div>
              </div>
            </div>

            {c.note ? (
              <div className="flex gap-4 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 shadow-sm">
                <FileText className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
                <div>
                  <h3 className="mb-1 text-sm font-bold text-amber-900">Ghi chú hợp đồng</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-800/90">{c.note}</p>
                </div>
              </div>
            ) : null}

            {(c.items?.length ?? 0) > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-5">
                  <Package className="size-5 text-slate-400" aria-hidden />
                  <h2 className="text-lg font-bold text-slate-900">Chi tiết sản phẩm vay</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full whitespace-nowrap text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-500">
                        <th className="px-6 py-4">Tên sản phẩm</th>
                        <th className="px-6 py-4 text-center">Số lượng</th>
                        <th className="px-6 py-4 text-right">Đơn giá</th>
                        <th className="px-6 py-4 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {(c.items ?? []).map((line, idx) => (
                        <tr key={`${line.productName}-${idx}`} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-medium text-slate-900">{line.productName}</td>
                          <td className="px-6 py-4 text-center text-slate-600">{line.quantity}</td>
                          <td className="px-6 py-4 text-right tabular-nums text-slate-600">{formatVnd(line.unitPrice)}</td>
                          <td className="px-6 py-4 text-right font-semibold tabular-nums text-slate-900">
                            {formatVnd(line.subTotal ?? Number(line.unitPrice) * line.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="size-5 text-slate-400" aria-hidden />
                  <h2 className="text-lg font-bold text-slate-900">Lịch sử thu tiền</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                  <CheckCircle className="size-4" aria-hidden />
                  Đã thu tổng cộng: {formatVnd(contractFinance.totalPaid)}
                </div>
              </div>

              <div className="overflow-x-auto">
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center p-12 text-center">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50">
                      <Receipt className="size-6 text-slate-300" aria-hidden />
                    </div>
                    <p className="font-medium text-slate-500">Chưa có giao dịch thu tiền nào.</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[720px] whitespace-nowrap text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-500">
                        <th className="px-6 py-4">Thời gian</th>
                        <th className="px-6 py-4 text-right">Số tiền thu</th>
                        <th className="px-6 py-4 text-right">Vào lãi</th>
                        <th className="px-6 py-4 text-right">Vào gốc</th>
                        <th className="px-6 py-4">Người thu</th>
                        <th className="px-6 py-4">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-medium text-slate-600">{formatPaymentDate(payment.paidAt)}</td>
                          <td className="px-6 py-4 text-right text-base font-bold tabular-nums text-teal-600">
                            +{formatVnd(payment.amount)}
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums text-amber-600">
                            {formatVnd(payment.appliedToInterest ?? 0)}
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums text-slate-600">
                            {formatVnd(payment.appliedToPrincipal ?? 0)}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <div className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                                {payment.receivedBy?.charAt(0) ?? '?'}
                              </div>
                              {payment.receivedBy || '—'}
                            </div>
                          </td>
                          <td className="max-w-[180px] truncate px-6 py-4 text-xs text-slate-500">{payment.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                Mã HĐ:{' '}
                <span className="rounded bg-slate-200/50 px-1.5 py-0.5 font-mono text-slate-500">{c.id}</span>
              </span>
              {c.createdBy ? <span>Tạo bởi: {c.createdBy}</span> : null}
            </div>
          </div>

          <div className="space-y-6 xl:sticky xl:top-[104px] xl:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
              <div className="p-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Tổng quan tài chính</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-600">Tổng gốc & lãi:</span>
                    <span className="text-lg font-bold tabular-nums text-slate-900">{formatVnd(contractFinance.totalExpected)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-600">Đã thanh toán:</span>
                    <div className="flex items-center gap-1.5 text-teal-600">
                      <ArrowUpRight className="size-4" aria-hidden />
                      <span className="text-lg font-bold tabular-nums">{formatVnd(contractFinance.totalPaid)}</span>
                    </div>
                  </div>

                  <div className="my-2 h-px w-full bg-slate-100" />

                  <div>
                    <span className="mb-1 block font-medium text-slate-500">Cần thu còn lại:</span>
                    <span className="text-3xl font-black tabular-nums tracking-tight text-rose-600">
                      {formatVnd(contractFinance.remainingAmount)}
                    </span>
                  </div>

                  {toNum(c.remainingPrincipal) <= 0 && contractFinance.remainingAmount > 0 ? (
                    <div className="mt-3 flex gap-2 rounded-xl border border-amber-100 bg-amber-50/80 p-3 text-sm text-amber-800">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <p>
                        Gốc đã về 0 nhưng vẫn còn khoản lãi/chênh lệch cần thu:{' '}
                        <strong className="tabular-nums">{formatVnd(contractFinance.remainingAmount)}</strong>.
                      </p>
                    </div>
                  ) : null}

                  {!showPaymentForm && canPay ? (
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(true)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98]"
                    >
                      <Plus className="size-4" aria-hidden />
                      Thêm giao dịch thu tiền
                    </button>
                  ) : null}
                </div>
              </div>

              {showPaymentForm && canPay ? (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-700">
                      <div className="rounded-lg bg-teal-100/50 p-1.5">
                        <Wallet className="size-5" aria-hidden />
                      </div>
                      <h2 className="text-base font-bold">Thêm giao dịch thu tiền</h2>
                    </div>
                    <button
                      type="button"
                      disabled={paymentMut.isPending}
                      onClick={() => setShowPaymentForm(false)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200/50 hover:text-slate-700"
                      title="Đóng form"
                    >
                      <X className="size-5" aria-hidden />
                    </button>
                  </div>

                  <form className="space-y-4" onSubmit={handleAddPaymentSubmit}>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="pay-amount">
                        Số tiền thu (VNĐ) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="pay-amount"
                        inputMode="numeric"
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 shadow-sm transition-shadow focus:border-teal-500 focus:ring-teal-500/20"
                        placeholder="VD: 5000000"
                        type="text"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                    </div>

                   
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="pay-note">
                        Ghi chú
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <FileText className="size-4 text-slate-400" aria-hidden />
                        </div>
                        <input
                          id="pay-note"
                          className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm transition-shadow focus:border-teal-500 focus:ring-teal-500/20"
                          placeholder="VD: Thu tiền mặt..."
                          type="text"
                          value={payNote}
                          onChange={(e) => setPayNote(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!canPay || paymentMut.isPending}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 active:scale-[0.98]"
                    >
                      {paymentMut.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Đang xử lý…
                        </span>
                      ) : (
                        <>
                          <Plus className="size-4" aria-hidden />
                          Xác nhận thu tiền
                        </>
                      )}
                    </button>
                   
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
