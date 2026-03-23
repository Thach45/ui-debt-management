import { ArrowLeft, Calendar, MapPin, Phone, User } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { CustomerTierBadge } from '@/features/customers/components/customer-tier-badge'
import { useCustomerDetailQuery } from '@/features/customers/hooks'
import { formatDate, formatVnd } from '@/shared/lib/format'

function toNum(v: string | number | null | undefined) {
  if (v === null || v === undefined) return 0
  return typeof v === 'number' ? v : Number(v) || 0
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: customer, isPending, isError, error } = useCustomerDetailQuery(id)

  if (!id) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10 text-left md:px-6">
        <p className="text-sm text-red-600">Thiếu mã khách hàng.</p>
        <Link className="mt-4 inline-block text-emerald-600 hover:underline" to="/customers">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10 text-left md:px-6">
        <p className="text-sm text-gray-500">Đang tải thông tin khách…</p>
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10 text-left md:px-6">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'Không tải được khách hàng.'}
        </p>
        <Link className="mt-4 inline-block text-emerald-600 hover:underline" to="/customers">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  const totalDebt = toNum(customer.totalRemainingDebt)
  const totalInterest = toNum(customer.totalExpectedInterest)
  const contracts = customer.contracts ?? []
  const count = contracts.length

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 text-left md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          to="/customers"
        >
          <ArrowLeft className="size-5" aria-hidden />
          <span>Quay lại danh sách</span>
        </Link>
        <Link
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-50"
          to={`/customers/${id}/edit`}
        >
          Sửa khách hàng
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <User className="size-10" aria-hidden />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              <span className="mt-2">
                <CustomerTierBadge tier={customer.customerTier} />
              </span>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-start gap-3 text-sm">
                <Phone className="mt-0.5 size-4 shrink-0 text-gray-400" aria-hidden />
                <span className="text-gray-900">{customer.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gray-400" aria-hidden />
                <div>
                  <span className="mb-0.5 block text-xs text-gray-500">Địa chỉ</span>
                  <span className="text-gray-900">{customer.address}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                <div>
                  <span className="mb-0.5 block text-xs text-gray-500">Vị trí rẫy / vườn</span>
                  <span className="font-medium text-gray-900">{customer.farmingLocation ?? '—'}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="mt-0.5 size-4 shrink-0 text-gray-400" aria-hidden />
                <div>
                  <span className="mb-0.5 block text-xs text-gray-500">Ngày tạo</span>
                  <span className="text-gray-900">{formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-sm">
            <h3 className="mb-2 text-sm font-medium text-emerald-100">Tổng dư nợ hiện tại</h3>
            <p className="text-3xl font-bold tabular-nums">{formatVnd(totalDebt)}</p>
            <p className="mt-2 text-sm text-emerald-100">Từ {count} hợp đồng</p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-medium text-orange-800">Tổng tiền lãi dự kiến</h3>
            <p className="text-3xl font-bold tabular-nums text-orange-600">{formatVnd(totalInterest)}</p>
            <p className="mt-2 text-sm text-orange-700/80">Từ tất cả các khoản vay</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900">Danh sách hợp đồng</h3>
            </div>
            {contracts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Khách hàng này chưa có hợp đồng nào.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {contracts.map((c) => {
                  const title = (c.productName && String(c.productName).trim()) || '—'
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="flex w-full flex-col gap-4 p-6 text-left transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => navigate(`/contracts/${c.id}`)}
                    >
                      <div>
                        <h4 className="mb-1 font-medium text-gray-900">{title}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span>Vay: {formatDate(c.startDate)}</span>
                          <span>Gốc: {formatVnd(c.principal)}</span>
                          <span className="font-medium text-orange-600">Lãi: {formatVnd(c.totalInterest)}</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="mb-1 font-semibold tabular-nums text-emerald-600">
                          {formatVnd(c.remainingAmount)}
                        </div>
                        <div className="text-xs text-gray-500">Còn lại</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
