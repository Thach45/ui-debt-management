import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { fetchAllCustomers } from '@/features/customers/service'
import { toast } from '@/shared/lib/notify'

export function useCustomersQuery() {
  const query = useQuery({
    queryKey: ['customers'],
    queryFn: fetchAllCustomers,
  })

  const refetchWithToast = useCallback(async () => {
    const result = await query.refetch()
    if (result.isError) {
      toast.error(
        result.error instanceof Error ? result.error.message : 'Không tải được danh sách khách hàng',
      )
    } else {
      toast.success('Đã cập nhật danh sách')
    }
    return result
  }, [query])

  return { ...query, refetchWithToast }
}
