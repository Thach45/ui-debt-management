import { FileText, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tổng quan</h1>
        <p className="mt-1 text-sm text-gray-500">Thống kê và quản lý bán trả góp nông sản</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          to="/contracts"
        >
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <FileText className="size-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700">
              Hợp đồng vay
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Xem danh sách, lọc theo trạng thái, tạo hợp đồng mới.
            </p>
          </div>
        </Link>

        <Link
          className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          to="/customers"
        >
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <Users className="size-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700">
              Khách hàng
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Danh sách, thêm / sửa / xóa (quyền ADMIN).
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
