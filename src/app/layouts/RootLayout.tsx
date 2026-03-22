import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/app/layouts/AppSidebar'

export function RootLayout() {
  return (
    <div className="app-shell flex h-[100dvh] overflow-hidden bg-gray-50/50 font-sans text-base leading-normal text-gray-900 antialiased">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-7 md:pb-7">
        <Outlet />
      </main>
    </div>
  )
}
