/** Khớp `ResponseApi` backend */
export type ResponseApi<T> = {
  success: boolean
  message: string | null
  data: T
}

/** Trường chính của `Page` Spring Data (JSON) */
export type SpringPage<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}
