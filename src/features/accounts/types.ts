export type UserRole = 'ADMIN' | 'STAFF'

export type UserAccountDto = {
  id: string
  username: string
  email: string
  phone: string | null
  role: UserRole
  status: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type RegisterUserPayload = {
  username: string
  password: string
  email: string
  phone?: string | null
  role: UserRole
}

export type UpdateUserPayload = {
  email?: string
  phone?: string | null
  password?: string | null
  role?: UserRole
  status?: string
}
