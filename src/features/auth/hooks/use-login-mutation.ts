import { useMutation } from '@tanstack/react-query'

import { loginRequest } from '@/features/auth/service/auth.service'
import { persistTokens } from '@/shared/lib/auth-storage'

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      persistTokens(data.accessToken, data.refreshToken)
    },
  })
}
