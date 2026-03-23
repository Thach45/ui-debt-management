import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/app/layouts/AppSidebar'

/** Khớp `remix/.../App.tsx`: main `pt-20 md:pt-8 pb-8 px-4 md:px-0` — nội dung trang dùng `max-w-6xl mx-auto px-6` */
export function RootLayout() {
  return (
    <div className="app-shell flex h-[100dvh] overflow-hidden bg-gray-50/50 font-sans text-base leading-normal text-gray-900 antialiased">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-20 md:px-0 md:pb-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
