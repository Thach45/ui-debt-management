import { useQuery } from '@tanstack/react-query'

import { fetchCustomerById } from '@/features/customers/service'
import { customerDetailQueryKey } from '@/shared/lib/query-keys'

export function useCustomerDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: customerDetailQueryKey(id),
    queryFn: () => fetchCustomerById(id!),
    enabled: Boolean(id),
  })
}
