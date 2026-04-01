import { apiClient, unwrapResponseApi } from '@/shared/api/client'
import type { ResponseApi } from '@/shared/types/api'

import type { CustomerPayload, CustomerRow } from '@/features/customers/type'

export async function fetchAllCustomers(): Promise<CustomerRow[]> {
  const res = await apiClient.get<ResponseApi<CustomerRow[]>>('/api/v1/customers')
  return unwrapResponseApi(res.data)
}

export async function fetchCustomerById(id: string): Promise<CustomerRow> {
  const res = await apiClient.get<ResponseApi<CustomerRow>>(`/api/v1/customers/${id}`)
  return unwrapResponseApi(res.data)
}

export async function createCustomer(payload: CustomerPayload): Promise<CustomerRow> {
  const res = await apiClient.post<ResponseApi<CustomerRow>>('/api/v1/customers', payload)
  return unwrapResponseApi(res.data)
}

export async function updateCustomer(id: string, payload: CustomerPayload): Promise<CustomerRow> {
  const res = await apiClient.put<ResponseApi<CustomerRow>>(`/api/v1/customers/${id}`, payload)
  return unwrapResponseApi(res.data)
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await apiClient.delete<ResponseApi<null>>(`/api/v1/customers/${id}`)
  unwrapResponseApi(res.data)
}

export async function searchCustomers(keyword: string): Promise<CustomerRow[]> {
  const res = await apiClient.get<ResponseApi<CustomerRow[]>>('/api/v1/customers/search', {
    params: { keyword },
  })
  return unwrapResponseApi(res.data)
}
