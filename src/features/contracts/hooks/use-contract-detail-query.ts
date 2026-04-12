import { useQuery } from '@tanstack/react-query'

import { fetchContractById } from '@/features/contracts/service'
import { contractDetailQueryKey } from '@/shared/lib/query-keys'

export function useContractDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: contractDetailQueryKey(id),
    queryFn: () => fetchContractById(id!),
    enabled: Boolean(id),
  })
}
