import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { CustomerTierBadge } from '@/features/customers/components/customer-tier-badge'
import {
  useCustomersQuery,
  useDeleteCustomerMutation,
} from '@/features/customers/hooks'
import type { CustomerRow } from '@/features/customers/type'
import { formatVnd } from '@/shared/lib/format'

function toNum(v: string | number | null | undefined) {
  if (v === null || v === undefined) return 0
  return typeof v === 'number' ? v : Number(v) || 0
}

export function CustomersPage() {
  const [q, setQ] = useState('')
  const { data, isPending, isError, error, isFetching, refetchWithToast } = useCustomersQuery()
  const deleteMutation = useDeleteCustomerMutation()

  const rows = useMemo(() => data ?? [], [data])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(t) ||
        r.phone.includes(t) ||
        (r.address ?? '').toLowerCase().includes(t) ||
        (r.farmingLocation ?? '').toLowerCase().includes(t),
    )
  }, [rows, q])

  function confirmDelete(row: CustomerRow) {
    if (!window.confirm(`Xóa khách hàng "${row.name}" (${row.phone})?`)) return
    deleteMutation.mutate(row.id)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 text-left md:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Khách hàng</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Danh sách khách hàng — chỉ tài khoản quản trị (ADMIN) mới gọi được API.
          </p>
        </div>
        <Link
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 md:w-auto"
          to="/customers/new"
        >
          <Plus className="size-5" aria-hidden />
          <span>Thêm khách hàng</span>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-1 text-sm font-medium text-gray-500 dark:text-slate-400">Tổng khách</div>
          <div className="text-xl font-bold tabular-nums text-gray-900 dark:text-slate-100">{rows.length}</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-1 text-sm font-medium text-gray-500 dark:text-slate-400">Đang hiển thị (lọc)</div>
          <div className="text-xl font-bold tabular-nums text-emerald-600">{filtered.length}</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-1 text-sm font-medium text-gray-500 dark:text-slate-400">Tổng dư nợ (danh sách)</div>
          <div className="text-xl font-bold tabular-nums text-orange-600">
            {formatVnd(rows.reduce((s, r) => s + toNum(r.totalCurrentDebt), 0))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              aria-hidden
            />
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none ring-emerald-500 placeholder:text-gray-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500"
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên, SĐT, địa chỉ…"
              type="search"
              value={q}
            />
          </div>
          <button
            className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            disabled={isFetching}
            onClick={() => void refetchWithToast()}
            title="Làm mới"
            type="button"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
            Làm mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500 dark:bg-slate-950/50 dark:text-slate-400">
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3">Hạng</th>
                <th className="px-4 py-3 text-right">Dư nợ</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {isPending ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-gray-500 dark:text-slate-400" colSpan={6}>
                    Đang tải…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-red-600" colSpan={6}>
                    {error instanceof Error ? error.message : 'Không tải được dữ liệu'}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-gray-500 dark:text-slate-400" colSpan={6}>
                    {rows.length === 0
                      ? 'Chưa có khách hàng. Thêm mới để bắt đầu.'
                      : 'Không có dòng nào khớp bộ lọc.'}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-950/40" key={row.id}>
                    <td className="px-4 py-3">
                      <Link
                        className="font-medium text-gray-900 hover:text-emerald-700 hover:underline dark:text-slate-100 dark:hover:text-emerald-200"
                        to={`/customers/${row.id}`}
                      >
                        {row.name}
                      </Link>
                      {row.farmingLocation ? (
                        <div className="text-sm text-gray-500 dark:text-slate-400">{row.farmingLocation}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-800 dark:text-slate-200">{row.phone}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-gray-600 dark:text-slate-300" title={row.address ?? ''}>
                      {row.address ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <CustomerTierBadge tier={row.customerTier} />
                    </td>
                    <td className="px-4 py-3 text-right text-base font-medium tabular-nums text-gray-900 dark:text-slate-100">
                      {formatVnd(row.totalCurrentDebt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                          title="Sửa"
                          to={`/customers/${row.id}/edit`}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                        <button
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          disabled={deleteMutation.isPending}
                          onClick={() => confirmDelete(row)}
                          title="Xóa"
                          type="button"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
