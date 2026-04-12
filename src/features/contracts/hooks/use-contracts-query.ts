import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { fetchContractsPage } from '@/features/contracts/service'
import { contractsPageQueryKey } from '@/shared/lib/query-keys'
import { toast } from '@/shared/lib/notify'

export function useContractsQuery(page: number, size: number) {
  const query = useQuery({
    queryKey: contractsPageQueryKey(page, size),
    queryFn: () => fetchContractsPage(page, size),
  })

  /** Dùng cho nút "Làm mới": toast khi refetch xong (thành công / lỗi) */
  const refetchWithToast = useCallback(async () => {
    const result = await query.refetch()
    if (result.isError) {
      toast.error(
        result.error instanceof Error ? result.error.message : 'Không tải được danh sách',
      )
    } else {
      toast.success('Đã cập nhật danh sách')
    }
    return result
  }, [query])

  return { ...query, refetchWithToast }
}
