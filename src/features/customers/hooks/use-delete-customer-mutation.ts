import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteCustomer } from '@/features/customers/service'
import { toast } from '@/shared/lib/notify'

export function useDeleteCustomerMutation() {
  const qc = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Đã xóa khách hàng')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không xóa được')
    },
  })
}
