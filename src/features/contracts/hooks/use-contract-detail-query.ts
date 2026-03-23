import { useQuery } from '@tanstack/react-query'

import { fetchContractById } from '@/features/contracts/service'

export function useContractDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => fetchContractById(id!),
    enabled: Boolean(id),
  })
}
