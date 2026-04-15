import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateCustomer } from '@/features/customers/service'
import type { CustomerPayload, CustomerRow } from '@/features/customers/type'
import { invalidateCustomerAndRelatedLists } from '@/shared/lib/query-keys'
import { toast } from '@/shared/lib/notify'

type Vars = { id: string; payload: CustomerPayload }

export function useUpdateCustomerMutation() {
  const qc = useQueryClient()

  return useMutation<CustomerRow, Error, Vars>({
    mutationFn: ({ id, payload }) => updateCustomer(id, payload),
    onSuccess: (_data, vars) => {
      invalidateCustomerAndRelatedLists(qc, vars.id)
      toast.success('Đã cập nhật khách hàng')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không cập nhật được')
    },
  })
}
