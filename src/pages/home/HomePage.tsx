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

/**
 * Dữ liệu mẫu — chỉ phục vụ giao diện tổng quan (chưa nối API).
 * Cấu trúc giống `remix/.../components/Dashboard.tsx`.
 */
const MOCK = {
  totalContracts: 24,
  activeCount: 12,
  overdueCount: 3,
  completedCount: 9,
  totalCollected: 452_500_000,
  totalRemaining: 186_300_000,
}

export function HomePage() {
  const statusData = [
    { name: 'Đang vay', value: MOCK.activeCount, color: '#3b82f6' },
    { name: 'Quá hạn', value: MOCK.overdueCount, color: '#ef4444' },
    { name: 'Đã tất toán', value: MOCK.completedCount, color: '#10b981' },
  ].filter((item) => item.value > 0)

  const financialData = [
    {
      name: 'Tài chính',
      'Đã thu': MOCK.totalCollected,
      'Còn lại': MOCK.totalRemaining,
    },
  ]

  const hasContracts = MOCK.totalContracts > 0

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tổng quan</h1>
        <p className="mt-1 text-gray-500">Thống kê và biểu đồ tình hình kinh doanh (dữ liệu mẫu)</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-500">
            <TrendingUp className="size-4 shrink-0" aria-hidden />
            Tổng hợp đồng
          </div>
          <div className="text-2xl font-bold tabular-nums text-gray-900">{MOCK.totalContracts}</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-blue-600">
            <Clock className="size-4 shrink-0" aria-hidden />
            Đang vay
          </div>
          <div className="text-2xl font-bold tabular-nums text-blue-700">{MOCK.activeCount}</div>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-red-600">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            Quá hạn
          </div>
          <div className="text-2xl font-bold tabular-nums text-red-700">{MOCK.overdueCount}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-1 text-sm font-medium text-emerald-600">
            <CheckCircle className="size-4 shrink-0" aria-hidden />
            Đã tất toán
          </div>
          <div className="text-2xl font-bold tabular-nums text-emerald-700">{MOCK.completedCount}</div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Trạng thái hợp đồng</h3>
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
              <div className="flex h-full items-center justify-center text-gray-500">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Tình hình thu hồi vốn</h3>
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
              <div className="flex h-full items-center justify-center text-gray-500">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        Số liệu trên là minh họa. Khi nối API, thay thế biến <code className="rounded bg-gray-100 px-1">MOCK</code>.
      </p>
    </div>
  )
}
