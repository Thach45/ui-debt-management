import { apiClient, unwrapResponseApi } from '@/shared/api/client'
import type { ResponseApi, SpringPage } from '@/shared/types/api'

import type { ContractCreatePayload, ContractRow } from '@/features/contracts/type'

export async function fetchContractsPage(
  page: number,
  size: number,
): Promise<SpringPage<ContractRow>> {
  const res = await apiClient.get<ResponseApi<SpringPage<ContractRow>>>('/api/v1/contracts', {
    params: { page, size },
  })
  return unwrapResponseApi(res.data)
}

export async function createContract(payload: ContractCreatePayload): Promise<ContractRow> {
  const res = await apiClient.post<ResponseApi<ContractRow>>('/api/v1/contracts', payload)
  return unwrapResponseApi(res.data)
}
