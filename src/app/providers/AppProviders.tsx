import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { createQueryClient } from '@/shared/lib/query-client'

const queryClient = createQueryClient()

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
