import { useEffect } from 'react'

import { applyThemeClass, getStoredTheme } from '@/shared/lib/theme'

export function ThemeInitializer() {
  useEffect(() => {
    applyThemeClass(getStoredTheme())
  }, [])

  return null
}

