import {  Moon, Sun } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/app/layouts/AppSidebar'
import {
  applyThemeClass,
  getStoredTheme,
  resolveTheme,
  setStoredTheme,
  type ThemeMode,
} from '@/shared/lib/theme'

const fabBtnClass =
  'flex size-12 items-center justify-center rounded-2xl border border-gray-200/90 bg-white text-gray-600 shadow-md transition-colors hover:border-emerald-300 hover:bg-emerald-50/90 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 active:scale-[0.98] dark:border-gray-700/80 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-emerald-400/60 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200'

/** Khớp `remix/.../App.tsx`: main `pt-20 md:pt-8 pb-8 px-4 md:px-0` — nội dung trang dùng `max-w-6xl mx-auto px-6` */
export function RootLayout() {
  const [theme, setTheme] = useState<ThemeMode>('system')

  useEffect(() => {
    const stored = getStoredTheme()
    setTheme(stored)
  }, [])

  const resolvedIsDark = useMemo(() => resolveTheme(theme) === 'dark', [theme])

  function toggleTheme() {
    const next: ThemeMode = resolvedIsDark ? 'light' : 'dark'
    setTheme(next)
    setStoredTheme(next)
    applyThemeClass(next)
  }

  return (
    <div className="app-shell flex h-[100dvh] overflow-hidden bg-white font-sans text-base leading-normal text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-white px-4 pb-8 pt-20 md:px-0 md:pb-8 md:pt-8 dark:bg-gray-950">
        <Outlet />
      </main>

      {/* Floating actions — UI only (except theme toggle) */}
      <div className="pointer-events-none fixed bottom-5 right-4 z-[90] flex flex-col items-end gap-3 md:bottom-8 md:right-8">
        <div className="pointer-events-auto flex flex-col gap-3">
          <button
            className={fabBtnClass}
            title={resolvedIsDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
            type="button"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
          >
            {resolvedIsDark ? <Sun className="size-6" strokeWidth={1.75} aria-hidden /> : <Moon className="size-6" strokeWidth={1.75} aria-hidden />}
          </button>
          
        </div>
      </div>
    </div>
  )
}
