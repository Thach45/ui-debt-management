import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCustomer } from '@/features/customers/service'
import type { CustomerPayload, CustomerRow } from '@/features/customers/type'
import { invalidateAfterCustomerCreate } from '@/shared/lib/query-keys'
import { toast } from '@/shared/lib/notify'

export function useCreateCustomerMutation() {
  const qc = useQueryClient()

  return useMutation<CustomerRow, Error, CustomerPayload>({
    mutationFn: createCustomer,
    onSuccess: () => {
      invalidateAfterCustomerCreate(qc)
      toast.success('Đã tạo khách hàng')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không tạo được khách hàng')
    },
  })
}
