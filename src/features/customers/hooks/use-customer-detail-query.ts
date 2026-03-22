import { useQuery } from '@tanstack/react-query'

import { fetchCustomerById } from '@/features/customers/service'

export function useCustomerDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomerById(id!),
    enabled: Boolean(id),
  })
}
