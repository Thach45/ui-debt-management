import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createContract } from '@/features/contracts/service'
import type { ContractCreatePayload, ContractRow } from '@/features/contracts/type'
import { customerDetailQueryKey, invalidateContractPortfolio } from '@/shared/lib/query-keys'
import { toast } from '@/shared/lib/notify'

/**
 * `onSuccess` / `onError` ở đây luôn gọi toast.
 * Ở component vẫn có thể `mutate(payload, { onSuccess: () => navigate(...) })` —
 * callback của `mutate` chạy sau, nên vừa toast vừa điều hướng được.
 */
export function useCreateContractMutation() {
  const qc = useQueryClient()

  return useMutation<ContractRow, Error, ContractCreatePayload>({
    mutationFn: createContract,
    onSuccess: (data, variables) => {
      invalidateContractPortfolio(qc)
      const customerId = data.customerId ?? variables.customerId
      if (customerId) {
        void qc.invalidateQueries({ queryKey: customerDetailQueryKey(customerId) })
      }
      toast.success('Tạo hợp đồng thành công')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không tạo được hợp đồng')
    },
  })
}
