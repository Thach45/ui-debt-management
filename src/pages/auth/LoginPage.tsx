import { Loader2, Lock, Mail, Sprout } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useLoginMutation } from '@/features/auth/hooks/use-login-mutation'
import { isAuthenticated } from '@/shared/lib/auth-storage'
import { toast } from '@/shared/lib/notify'

const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 outline-none transition-shadow focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const loginMutation = useLoginMutation()

  if (isAuthenticated()) {
    return <Navigate replace to="/" />
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    if (!email || !password) {
      toast.error('Nhập email và mật khẩu.')
      return
    }
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success('Đăng nhập thành công')
          navigate(from, { replace: true })
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Đăng nhập thất bại')
        },
      },
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-emerald-50/80 to-gray-50 px-4 py-10 dark:from-slate-950 dark:to-slate-900">
      <div className="mb-8 flex items-center gap-2">
        <Sprout className="size-10 text-emerald-600" aria-hidden />
        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
          Agri<span className="text-emerald-600">Pay</span>
        </span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900 dark:text-slate-100">Đăng nhập</h1>
        <p className="mb-8 text-center text-sm text-gray-500 dark:text-slate-400">Quản lý trả góp nông sản</p>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300" htmlFor="login-email">
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                aria-hidden
              />
              <input
                autoComplete="email"
                className={`${inputClass} pl-11`}
                id="login-email"
                name="email"
                placeholder="admin@example.com"
                required
                type="email"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300" htmlFor="login-password">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                aria-hidden
              />
              <input
                autoComplete="current-password"
                className={`${inputClass} pl-11`}
                id="login-password"
                name="password"
                placeholder="••••••"
                required
                type="password"
              />
            </div>
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:bg-emerald-400"
            disabled={loginMutation.isPending}
            type="submit"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Đang đăng nhập…
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {import.meta.env.DEV ? (
          <p className="mt-6 text-center text-xs text-gray-400 dark:text-slate-500">
            Seed: <span className="font-mono">admin@example.com</span> /{' '}
            <span className="font-mono">123456</span>
          </p>
        ) : null}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
        Chưa có tài khoản? Liên hệ quản trị.
      </p>
    </div>
  )
}
