import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Package,
  Phone,
  Plus,
  Share2,
  Trash2,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { deleteContract } from '@/features/contracts/service'
import { useContractDetailQuery } from '@/features/contracts/hooks'
import { toast } from '@/shared/lib/notify'
import {
  calculateLoanDetailsFromContract,
  contractProductLabel,
} from '@/shared/lib/contract-loan-details'
import { formatDate, formatVnd } from '@/shared/lib/format'

function formatPaymentDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return formatDate(iso)
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: c, isPending, isError, error } = useContractDetailQuery(id)

  const [showCopied, setShowCopied] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0])
  const [payNote, setPayNote] = useState('')

  const details = useMemo(() => (c ? calculateLoanDetailsFromContract(c) : null), [c])

  const deleteMut = useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      toast.success('Đã xóa hợp đồng')
      void qc.invalidateQueries({ queryKey: ['contracts'] })
      navigate('/contracts', { replace: true })
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Không xóa được hợp đồng')
    },
  })

  function handleShare() {
    if (!c || !details) return
    const productLine = contractProductLabel(c)
    const text = `HỢP ĐỒNG TRẢ GÓP
Khách hàng: ${c.customerName}
Hàng hóa: ${productLine}
Nợ gốc: ${formatVnd(c.principal)}
Thời gian: Từ ${formatDate(c.startDate)} đến ${formatDate(c.endDate)} (${details.totalDays} ngày)
Tiền lãi/ngày: ${formatVnd(details.interestPerDay)}
Tổng tiền lãi: ${formatVnd(details.totalInterest)}
Tổng phải thanh toán: ${formatVnd(details.totalExpected)}
Đã thanh toán: ${formatVnd(details.totalPaid)}
Còn lại: ${formatVnd(details.remainingAmount)}
`
    void navigator.clipboard.writeText(text)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  function handleAddPaymentSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.info('Ghi nhận thu tiền qua API sẽ được bổ sung sau — hiện chỉ xem lịch sử từ máy chủ.')
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-center text-sm text-gray-500">Đang tải hợp đồng…</div>
    )
  }

  if (isError || !c || !details) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-center text-sm text-red-600">
          {error instanceof Error ? error.message : 'Không tải được hợp đồng'}
        </p>
        <div className="mt-4 text-center">
          <Link className="text-emerald-600 hover:underline" to="/contracts">
            Về danh sách hợp đồng
          </Link>
        </div>
      </div>
    )
  }

  const productLine = contractProductLabel(c)
  const payments = c.paymentRecords ?? []

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="flex w-fit items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
          to="/contracts"
        >
          <ArrowLeft className="size-5 shrink-0" aria-hidden />
          <span>Quay lại danh sách</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            onClick={handleShare}
            type="button"
          >
            {showCopied ? <CheckCircle className="size-[18px]" aria-hidden /> : <Share2 className="size-[18px]" aria-hidden />}
            <span>{showCopied ? 'Đã copy' : 'Copy gửi Zalo'}</span>
          </button>
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            disabled={deleteMut.isPending}
            onClick={() => {
              if (
                window.confirm(
                  'Bạn có chắc chắn muốn xóa hợp đồng này? Mọi dữ liệu thu tiền sẽ bị mất.',
                )
              ) {
                deleteMut.mutate(c.id)
              }
            }}
            type="button"
          >
            <Trash2 className="size-[18px]" aria-hidden />
            <span>Xóa hợp đồng</span>
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <User className="size-7" aria-hidden />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold text-gray-900">{c.customerName}</h1>
                    {details.status === 'overdue' ? (
                      <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        <AlertCircle className="size-3" aria-hidden /> Quá hạn
                      </span>
                    ) : null}
                    {details.status === 'completed' ? (
                      <span className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle className="size-3" aria-hidden /> Đã tất toán
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4">
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5 shrink-0" aria-hidden /> {c.customerPhone}
                    </span>
                    <span className="flex min-w-0 items-center gap-1">
                      <Package className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{productLine}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="mb-1 text-sm text-gray-500">Thời gian vay ({details.totalDays} ngày)</div>
                <div className="text-base font-medium text-gray-900">
                  {formatDate(c.startDate)} <span className="mx-1 text-gray-400">→</span> {formatDate(c.endDate)}
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Nợ gốc</p>
                <p className="text-lg font-semibold text-gray-900">{formatVnd(c.principal)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Lãi suất</p>
                <p className="text-lg font-semibold text-gray-900">{String(c.interestRate)}%/tháng</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Tiền lãi / ngày</p>
                <p className="text-lg font-semibold text-orange-600">{formatVnd(details.interestPerDay)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Tổng tiền lãi</p>
                <p className="text-lg font-semibold text-orange-600">{formatVnd(details.totalInterest)}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-gray-600">Tổng phải thanh toán (Gốc + Lãi):</span>
                <span className="text-xl font-semibold text-gray-900">{formatVnd(details.totalExpected)}</span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-gray-600">Đã thanh toán:</span>
                <span className="text-lg font-medium text-emerald-600">{formatVnd(details.totalPaid)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="font-medium text-gray-900">Còn lại cần thu:</span>
                <span className="text-2xl font-bold text-emerald-600">{formatVnd(details.remainingAmount)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-4 text-xs text-gray-400">
              <span>
                Mã: <span className="font-mono text-gray-500">{c.id}</span>
              </span>
              {c.createdBy ? <span className="text-gray-500">Người tạo: {c.createdBy}</span> : null}
            </div>
          </div>

          {c.note ? (
            <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <FileText className="size-5 shrink-0 text-amber-600" aria-hidden />
              <div>
                <h3 className="mb-1 text-sm font-semibold text-amber-800">Ghi chú hợp đồng</h3>
                <p className="whitespace-pre-wrap text-sm text-amber-900">{c.note}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-emerald-600">
            <Plus className="size-5" aria-hidden />
            <h2 className="text-lg font-semibold text-gray-900">Thêm giao dịch thu tiền</h2>
          </div>

          <form className="space-y-4" onSubmit={handleAddPaymentSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pay-amount">
                Số tiền thu (VNĐ)
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
                id="pay-amount"
                min={0}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Nhập số tiền..."
                type="number"
                value={payAmount}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pay-date">
                Ngày thu
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
                id="pay-date"
                onChange={(e) => setPayDate(e.target.value)}
                type="date"
                value={payDate}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pay-note">
                Ghi chú
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
                id="pay-note"
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="VD: Thu tiền mặt..."
                type="text"
                value={payNote}
              />
            </div>
            <button
              className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-400"
              disabled={details.remainingAmount <= 0}
              type="submit"
            >
              Lưu giao dịch
            </button>
            <p className="text-center text-xs text-gray-400">Ghi nhận qua API đang phát triển — bấm sẽ thông báo.</p>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Lịch sử thu tiền</h2>
          <div className="text-sm text-gray-500">
            Đã thu:{' '}
            <span className="font-semibold text-emerald-600">{formatVnd(details.totalPaid)}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Chưa có giao dịch thu tiền nào.</div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 text-sm uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Ngày thu</th>
                  <th className="px-6 py-4 font-medium">Số tiền</th>
                  <th className="px-6 py-4 font-medium">Ghi chú</th>
                  <th className="px-6 py-4 font-medium">Người thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr className="transition-colors hover:bg-gray-50/50" key={payment.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatPaymentDate(payment.paidAt)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">{formatVnd(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.note || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.receivedBy || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {(c.items?.length ?? 0) > 0 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900">Chi tiết hàng hóa</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 text-sm uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Sản phẩm</th>
                  <th className="px-6 py-4 font-medium text-right">SL</th>
                  <th className="px-6 py-4 font-medium text-right">Đơn giá</th>
                  <th className="px-6 py-4 font-medium text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(c.items ?? []).map((line, idx) => (
                  <tr className="hover:bg-gray-50/50" key={`${line.productName}-${idx}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{line.productName}</td>
                    <td className="px-6 py-4 text-right text-sm tabular-nums text-gray-700">{line.quantity}</td>
                    <td className="px-6 py-4 text-right text-sm tabular-nums text-gray-700">
                      {formatVnd(line.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium tabular-nums text-gray-900">
                      {formatVnd(line.subTotal ?? Number(line.unitPrice) * line.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
