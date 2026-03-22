import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCustomer } from '@/features/customers/service'
import type { CustomerPayload, CustomerRow } from '@/features/customers/type'
import { toast } from '@/shared/lib/notify'

export function useCreateCustomerMutation() {
  const qc = useQueryClient()

  return useMutation<CustomerRow, Error, CustomerPayload>({
    mutationFn: createCustomer,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Đã tạo khách hàng')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không tạo được khách hàng')
    },
  })
}
