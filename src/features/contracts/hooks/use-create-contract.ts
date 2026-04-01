import { useMutation } from '@tanstack/react-query'

import { createContract } from '@/features/contracts/service'
import type { ContractCreatePayload, ContractRow } from '@/features/contracts/type'
import { toast } from '@/shared/lib/notify'

/**
 * `onSuccess` / `onError` ở đây luôn gọi toast.
 * Ở component vẫn có thể `mutate(payload, { onSuccess: () => navigate(...) })` —
 * callback của `mutate` chạy sau, nên vừa toast vừa điều hướng được.
 */
export function useCreateContractMutation() {
  return useMutation<ContractRow, Error, ContractCreatePayload>({
    mutationFn: createContract,
    onSuccess: () => {
      toast.success('Tạo hợp đồng thành công')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không tạo được hợp đồng')
    },
  })
}
