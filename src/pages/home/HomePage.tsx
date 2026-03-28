import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatVnd } from '@/shared/lib/format'

import { useDashboardStatsQuery } from '@/features/dashboard/hooks'

export function HomePage() {
  const statsQuery = useDashboardStatsQuery()
  const stats = statsQuery.data

  const statusData = [
    { name: 'Đang vay', value: (stats?.activeCount ?? 0), color: '#3b82f6' },
    { name: 'Quá hạn', value: (stats?.overdueCount ?? 0), color: '#ef4444' },
    { name: 'Đã tất toán', value: (stats?.completedCount ?? 0), color: '#10b981' },
  ].filter((item) => item.value > 0)

  const financialData = [
    {
      name: 'Tài chính',
      'Đã thu': (stats?.totalCollected ?? 0),
      'Còn lại': (stats?.totalRemaining ?? 0),
    },
  ]

  const hasContracts = (stats?.totalContracts ?? 0) > 0

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Tổng quan</h1>
        <p className="mt-1 text-gray-500 dark:text-slate-400">Thống kê và biểu đồ tình hình kinh doanh</p>
      </div>

      {statsQuery.isError ? (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {(statsQuery.error as Error).message || 'Không tải được số liệu tổng quan.'}
        </div>
      ) : null}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-slate-400">
            <TrendingUp className="size-4 shrink-0" aria-hidden />
            Tổng hợp đồng
          </div>
          <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-slate-100">
            {(stats?.totalContracts ?? 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-blue-600">
            <Clock className="size-4 shrink-0" aria-hidden />
            Đang vay
          </div>
          <div className="text-2xl font-bold tabular-nums text-blue-700">{(stats?.activeCount ?? 0)}</div>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-red-600">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            Quá hạn
          </div>
          <div className="text-2xl font-bold tabular-nums text-red-700">{(stats?.overdueCount ?? 0)}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/15">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-emerald-600">
            <CheckCircle className="size-4 shrink-0" aria-hidden />
            Đã tất toán
          </div>
          <div className="text-2xl font-bold tabular-nums text-emerald-700">{(stats?.completedCount ?? 0)}</div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-slate-100">Trạng thái hợp đồng</h3>
          <div className="h-72">
            {hasContracts && statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    dataKey="value"
                    innerRadius={60}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500 dark:text-slate-400">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-slate-100">Tình hình thu hồi vốn</h3>
          <div className="h-72">
            {hasContracts ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={financialData}
                  margin={{ top: 20, right: 30, left: 8, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}M`} />
                  <Tooltip formatter={(value: number | string) => formatVnd(value)} />
                  <Legend />
                  <Bar dataKey="Đã thu" fill="#10b981" radius={[0, 0, 4, 4]} stackId="a" />
                  <Bar dataKey="Còn lại" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500 dark:text-slate-400">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-slate-500">Số liệu lấy từ API.</p>
    </div>
  )
}
