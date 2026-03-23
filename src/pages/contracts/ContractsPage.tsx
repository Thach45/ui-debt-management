import { AlertCircle, Filter, Plus, RefreshCw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ContractStatusBadge } from '@/features/contracts/components/contract-status-badge'
import { useContractsQuery } from '@/features/contracts/hooks'
import type { ContractRow } from '@/features/contracts/type'
import { formatDate, formatVnd } from '@/shared/lib/format'

function toNum(v: string | number) {
  return typeof v === 'number' ? v : Number(v) || 0
}

type StatusFilter = 'all' | 'overdue' | 'completed'

export function ContractsPage() {
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { data, isPending, isError, error, isFetching, refetchWithToast } = useContractsQuery(
    page,
    size,
  )

  const rows = useMemo(() => data?.content ?? [], [data?.content])

  const metrics = useMemo(() => {
    let totalPrincipal = 0
    let totalValue = 0
    let overdue = 0
    for (const r of rows) {
      totalPrincipal += toNum(r.principal)
      totalValue += toNum(r.totalValue)
      if (r.status === 'OVERDUE') overdue += 1
    }
    return { totalPrincipal, totalValue, overdue }
  }, [rows])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return rows.filter((r) => {
      const matchQ =
        !t ||
        r.customerName.toLowerCase().includes(t) ||
        r.customerPhone.includes(t) ||
        r.id.toLowerCase().includes(t)
      if (!matchQ) return false
      if (statusFilter === 'overdue') return r.status === 'OVERDUE'
      if (statusFilter === 'completed') return r.status === 'COMPLETED'
      return true
    })
  }, [rows, q, statusFilter])

  return (
    <div className="mx-auto max-w-6xl px-5 text-left md:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hợp đồng vay</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý các hợp đồng vay và trả góp</p>
        </div>
        <Link
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 md:w-auto"
          to="/contracts/new"
        >
          <Plus className="size-5" aria-hidden />
          <span>Tạo hợp đồng mới</span>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 text-sm font-medium text-gray-500">Tổng dư nợ (trang này)</div>
          <div className="text-xl font-bold tabular-nums text-gray-900">
            {formatVnd(metrics.totalPrincipal)}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 text-sm font-medium text-gray-500">Tổng giá trị (trang này)</div>
          <div className="text-xl font-bold tabular-nums text-orange-600">
            {formatVnd(metrics.totalValue)}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 text-sm font-medium text-gray-500">Số hợp đồng (trang này)</div>
          <div className="text-xl font-bold tabular-nums text-emerald-600">{rows.length}</div>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-red-600">
            <AlertCircle className="size-4" aria-hidden />
            Quá hạn (trang này)
          </div>
          <div className="text-xl font-bold tabular-nums text-red-700">
            {metrics.overdue}{' '}
            <span className="text-base font-normal text-red-500">hợp đồng</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none ring-emerald-500 placeholder:text-gray-400 focus:ring-2"
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên khách, SĐT, mã hợp đồng…"
              type="search"
              value={q}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="size-5 shrink-0 text-gray-400" aria-hidden />
            <button
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setStatusFilter('all')}
              type="button"
            >
              Tất cả
            </button>
            <button
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'overdue'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setStatusFilter('overdue')}
              type="button"
            >
              Quá hạn
            </button>
            <button
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setStatusFilter('completed')}
              type="button"
            >
              Đã tất toán
            </button>
            <button
              className="ml-0.5 flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={isFetching}
              onClick={() => void refetchWithToast()}
              title="Làm mới"
              type="button"
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3 text-right">Tổng giá trị</th>
                <th className="px-4 py-3 text-right">Nợ gốc</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3">Người tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isPending ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-gray-500" colSpan={7}>
                    Đang tải…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-red-600" colSpan={7}>
                    {error instanceof Error ? error.message : 'Không tải được dữ liệu'}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-gray-500" colSpan={7}>
                    Không tìm thấy hợp đồng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((row: ContractRow, i: number) => (
                  <tr
                    className="group cursor-default transition-colors hover:bg-gray-50/80"
                    key={row.id}
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {q.trim() || statusFilter !== 'all' ? i + 1 : page * size + i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        className="block rounded-lg outline-none ring-emerald-500 focus-visible:ring-2"
                        to={`/contracts/${row.id}`}
                      >
                        <div className="text-base font-medium text-gray-900 transition-colors group-hover:text-emerald-600">
                          {row.customerName}
                        </div>
                        <div className="text-sm text-gray-500">{row.customerPhone}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-base font-medium tabular-nums text-gray-900">
                      {formatVnd(row.totalValue)}
                    </td>
                    <td className="px-4 py-3 text-right text-base font-medium tabular-nums text-emerald-600">
                      {formatVnd(row.principal)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm leading-snug text-gray-500">
                        Bắt đầu: {formatDate(row.startDate)}
                      </div>
                      <div className="text-sm leading-snug text-gray-500">
                        Hạn: {formatDate(row.endDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ContractStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-5 py-3.5 text-sm text-gray-600">
            <span>
              Trang {data.number + 1} / {data.totalPages} — {data.totalElements} hợp đồng
            </span>
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-50 disabled:opacity-40"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                type="button"
              >
                Trước
              </button>
              <button
                className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-50 disabled:opacity-40"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                type="button"
              >
                Sau
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
