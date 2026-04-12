import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteCustomer } from '@/features/customers/service'
import { invalidateAfterCustomerDelete } from '@/shared/lib/query-keys'
import { toast } from '@/shared/lib/notify'

export function useDeleteCustomerMutation() {
  const qc = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteCustomer,
    onSuccess: (_data, customerId) => {
      invalidateAfterCustomerDelete(qc, customerId)
      toast.success('Đã xóa khách hàng')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không xóa được')
    },
  })
}
