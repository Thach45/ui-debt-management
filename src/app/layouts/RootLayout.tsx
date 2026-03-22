import { Link, Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="app-root mx-auto flex min-h-svh w-full max-w-[1126px] flex-1 flex-col border-x border-[var(--border)] text-center">
      <header className="app-header border-b border-[var(--border)] px-4 py-3">
        <nav className="flex justify-center gap-4 text-sm font-medium">
          <Link className="text-[var(--text-h)] underline-offset-4 hover:underline" to="/">
            Trang chủ
          </Link>
        </nav>
      </header>
      <main className="app-main flex flex-1 flex-col px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
