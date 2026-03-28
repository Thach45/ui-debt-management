import { apiClient, unwrapResponseApi } from '@/shared/api/client'
import type { ResponseApi, SpringPage } from '@/shared/types/api'

import type {
  ContractCreatePayload,
  ContractDetail,
  ContractRow,
  PaymentCollectPayload,
} from '@/features/contracts/type'

export async function fetchContractsPage(
  page: number,
  size: number,
  customerId?: string,
): Promise<SpringPage<ContractRow>> {
  const params: Record<string, string | number> = { page, size }
  if (customerId) params.customerId = customerId
  const res = await apiClient.get<ResponseApi<SpringPage<ContractRow>>>('/api/v1/contracts', {
    params,
  })
  return unwrapResponseApi(res.data)
}

export async function createContract(payload: ContractCreatePayload): Promise<ContractRow> {
  const res = await apiClient.post<ResponseApi<ContractRow>>('/api/v1/contracts', payload)
  return unwrapResponseApi(res.data)
}

export async function fetchContractById(id: string): Promise<ContractDetail> {
  const res = await apiClient.get<ResponseApi<ContractDetail>>(`/api/v1/contracts/${id}`)
  return unwrapResponseApi(res.data)
}

export async function deleteContract(id: string): Promise<void> {
  const res = await apiClient.delete<ResponseApi<null>>(`/api/v1/contracts/${id}`)
  unwrapResponseApi(res.data)
}

/** Ghi nhận thu tiền trừ nợ gốc — POST `/api/v1/payments/collect` */
export async function collectPayment(payload: PaymentCollectPayload): Promise<ContractDetail> {
  const res = await apiClient.post<ResponseApi<ContractDetail>>('/api/v1/payments/collect', payload)
  return unwrapResponseApi(res.data)
}
