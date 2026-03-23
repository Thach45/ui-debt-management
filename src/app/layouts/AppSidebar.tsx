import { FileText, LayoutDashboard, LogOut, Menu, Sprout, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { clearAuthTokens } from '@/shared/lib/auth-storage'

const navItems = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, match: (p: string) => p === '/' },
  {
    to: '/contracts',
    label: 'Hợp đồng vay',
    icon: FileText,
    match: (p: string) => p === '/contracts' || p.startsWith('/contracts/'),
  },
  {
    to: '/customers',
    label: 'Khách hàng',
    icon: Users,
    match: (p: string) => p === '/customers' || p.startsWith('/customers/'),
  },
]

export function AppSidebar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  function logout() {
    clearAuthTokens()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Sprout className="size-6 text-emerald-600" aria-hidden />
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Agri<span className="text-emerald-600">Pay</span>
          </span>
        </div>
        <button
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open ? (
        <button
          aria-label="Đóng overlay"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="hidden h-16 items-center border-b border-gray-200 px-6 md:flex">
          <div className="flex items-center gap-2">
            <Sprout className="size-7 text-emerald-600" aria-hidden />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Agri<span className="text-emerald-600">Pay</span>
            </span>
          </div>
        </div>
        <div className="h-16 md:hidden" />
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.match(pathname)
            return (
              <Link
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                key={item.to}
                onClick={() => setOpen(false)}
                to={item.to}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => {
              setOpen(false)
              logout()
            }}
            type="button"
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  )
}
