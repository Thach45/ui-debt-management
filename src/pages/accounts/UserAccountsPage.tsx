import { KeyRound, Pencil, Plus, Search, Shield, ShieldAlert, Trash2, UserCheck, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { RoleManagementTab } from '@/pages/accounts/RoleManagementTab'
import {
  deleteUser,
  fetchUsers,
  registerUser,
  updateUser,
} from '@/features/accounts/service/user-account-api'
import type { UpdateUserPayload, UserAccountDto, UserRole } from '@/features/accounts/types'
import { toast } from '@/shared/lib/notify'

type AccountStatus = 'active' | 'locked'

const inputClass =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500'

function normalizeStatus(s: string | null | undefined): AccountStatus {
  return s === 'locked' ? 'locked' : 'active'
}

export function UserAccountsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'accounts' | 'roles'>('accounts')
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'STAFF' as UserRole,
    status: 'active' as AccountStatus,
  })

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: tab === 'accounts',
  })

  const rows: UserAccountDto[] = usersQuery.data ?? []

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter(
      (r) =>
        r.username.toLowerCase().includes(t) ||
        r.email.toLowerCase().includes(t) ||
        (r.phone ?? '').toLowerCase().includes(t),
    )
  }, [rows, q])

  const summary = useMemo(() => {
    const total = rows.length
    const active = rows.filter((r) => normalizeStatus(r.status) === 'active').length
    const admins = rows.filter((r) => r.role === 'ADMIN').length
    return { total, active, admins }
  }, [rows])

  const registerMut = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Đã tạo tài khoản')
      void qc.invalidateQueries({ queryKey: ['users'] })
      closeModal()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) => updateUser(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật tài khoản')
      void qc.invalidateQueries({ queryKey: ['users'] })
      closeModal()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Đã xóa tài khoản')
      void qc.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const toggleLockMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateUser(id, { status }),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái')
      void qc.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setEditingId(null)
    setForm({ username: '', password: '', email: '', phone: '', role: 'STAFF', status: 'active' })
    setModalOpen(true)
  }

  function openEdit(row: UserAccountDto) {
    setEditingId(row.id)
    setForm({
      username: row.username,
      password: '',
      email: row.email,
      phone: row.phone ?? '',
      role: row.role,
      status: normalizeStatus(row.status),
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      const payload: UpdateUserPayload = {
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role: form.role,
        status: form.status,
      }
      if (form.password.trim()) {
        payload.password = form.password
      }
      updateMut.mutate({ id: editingId, payload })
      return
    }

    registerMut.mutate({
      username: form.username.trim(),
      password: form.password,
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      role: form.role,
    })
  }

  function confirmDelete(row: UserAccountDto) {
    if (!window.confirm(`Xóa tài khoản "${row.username}"?`)) return
    deleteMut.mutate(row.id)
  }

  function toggleLock(row: UserAccountDto) {
    const next = normalizeStatus(row.status) === 'active' ? 'locked' : 'active'
    toggleLockMut.mutate({ id: row.id, status: next })
  }

  const saving = registerMut.isPending || updateMut.isPending

  return (
    <div className="mx-auto max-w-6xl px-5 text-left md:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tài khoản hệ thống</h1>
          <p className="mt-1 text-sm text-gray-500">
            {tab === 'accounts'
              ? 'Quản lý người dùng (ADMIN / STAFF) — đồng bộ với API backend.'
              : 'Gán permission (mã endpoint) cho từng vai trò — dữ liệu từ API.'}
          </p>
        </div>
        {tab === 'accounts' ? (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 md:w-auto"
            onClick={openCreate}
            type="button"
          >
            <Plus className="size-5" aria-hidden />
            Thêm tài khoản
          </button>
        ) : null}
      </div>

      <div className="mb-6 flex gap-1 border-b border-gray-200">
        <button
          className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'accounts'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setTab('accounts')}
          type="button"
        >
          Tài khoản
        </button>
        <button
          className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'roles'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setTab('roles')}
          type="button"
        >
          Quản lý role
        </button>
      </div>

      {tab === 'roles' ? (
        <RoleManagementTab />
      ) : null}

      {tab === 'accounts' ? (
        <>
          {usersQuery.isError ? (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
              {(usersQuery.error as Error).message || 'Không tải được danh sách tài khoản.'}
            </div>
          ) : null}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-1 text-sm font-medium text-gray-500">Tổng tài khoản</div>
              <div className="text-xl font-bold tabular-nums text-gray-900">{summary.total}</div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-1 text-sm font-medium text-gray-500">Đang hoạt động</div>
              <div className="text-xl font-bold tabular-nums text-emerald-600">{summary.active}</div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-1 text-sm font-medium text-gray-500">Quản trị (ADMIN)</div>
              <div className="text-xl font-bold tabular-nums text-amber-700">{summary.admins}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search
                  className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none ring-emerald-500 placeholder:text-gray-400 focus:ring-2"
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo tên đăng nhập, email, SĐT…"
                  type="search"
                  value={q}
                />
              </div>
              {usersQuery.isFetching ? (
                <span className="text-xs text-gray-400">Đang làm mới…</span>
              ) : null}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Tên đăng nhập</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">SĐT</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Đăng nhập cuối</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersQuery.isLoading ? (
                    <tr>
                      <td className="px-4 py-10 text-center text-gray-500" colSpan={7}>
                        Đang tải danh sách…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-4 py-10 text-center text-gray-500" colSpan={7}>
                        Không có dòng nào khớp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr className="hover:bg-gray-50/80" key={row.id}>
                        <td className="px-4 py-3 font-mono text-sm text-gray-900">{row.username}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-gray-600" title={row.email}>
                          {row.email}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{row.phone ?? '—'}</td>
                        <td className="px-4 py-3">
                          {row.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                              <Shield className="size-3.5" aria-hidden />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-900">
                              <UserCheck className="size-3.5" aria-hidden />
                              STAFF
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {normalizeStatus(row.status) === 'active' ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                              Hoạt động
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              Đã khóa
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-gray-600">—</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                              disabled={toggleLockMut.isPending || deleteMut.isPending}
                              onClick={() => openEdit(row)}
                              title="Sửa"
                              type="button"
                            >
                              <Pencil className="size-4" aria-hidden />
                            </button>
                            <button
                              className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                              disabled={toggleLockMut.isPending || deleteMut.isPending}
                              onClick={() => toggleLock(row)}
                              title={normalizeStatus(row.status) === 'active' ? 'Khóa' : 'Mở khóa'}
                              type="button"
                            >
                              {normalizeStatus(row.status) === 'active' ? (
                                <KeyRound className="size-4" aria-hidden />
                              ) : (
                                <ShieldAlert className="size-4" aria-hidden />
                              )}
                            </button>
                            <button
                              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              disabled={toggleLockMut.isPending || deleteMut.isPending}
                              onClick={() => confirmDelete(row)}
                              title="Xóa"
                              type="button"
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {modalOpen ? (
            <div
              aria-modal="true"
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              role="dialog"
            >
              <button
                aria-label="Đóng"
                className="absolute inset-0 bg-black/40"
                onClick={closeModal}
                type="button"
              />
              <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingId ? 'Sửa tài khoản' : 'Thêm tài khoản'}
                  </h2>
                  <button
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    onClick={closeModal}
                    type="button"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="ua-username">
                      Tên đăng nhập
                    </label>
                    <input
                      autoComplete="username"
                      className={inputClass}
                      disabled={!!editingId}
                      id="ua-username"
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                      required
                      value={form.username}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="ua-password">
                      {editingId ? 'Mật khẩu mới' : 'Mật khẩu'}
                    </label>
                    <input
                      autoComplete={editingId ? 'new-password' : 'new-password'}
                      className={inputClass}
                      id="ua-password"
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder={editingId ? 'Để trống nếu không đổi' : ''}
                      required={!editingId}
                      type="password"
                      value={form.password}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="ua-email">
                      Email
                    </label>
                    <input
                      autoComplete="email"
                      className={inputClass}
                      id="ua-email"
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                      type="email"
                      value={form.email}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="ua-phone">
                      Số điện thoại
                    </label>
                    <input
                      className={inputClass}
                      id="ua-phone"
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      type="tel"
                      value={form.phone}
                    />
                  </div>
                  <div className={`grid grid-cols-1 gap-4 ${editingId ? 'sm:grid-cols-2' : ''}`}>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="ua-role">
                        Vai trò
                      </label>
                      <select
                        className={inputClass}
                        id="ua-role"
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                        value={form.role}
                      >
                        <option value="STAFF">Nhân viên (STAFF)</option>
                        <option value="ADMIN">Quản trị (ADMIN)</option>
                      </select>
                    </div>
                    {editingId ? (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="ua-status">
                          Trạng thái
                        </label>
                        <select
                          className={inputClass}
                          id="ua-status"
                          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AccountStatus }))}
                          value={form.status}
                        >
                          <option value="active">Hoạt động</option>
                          <option value="locked">Đã khóa</option>
                        </select>
                      </div>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-400">
                    {editingId
                      ? 'Đổi mật khẩu: nhập mật khẩu mới; để trống để giữ mật khẩu hiện tại.'
                      : 'Mật khẩu tối thiểu 6 ký tự (theo backend).'}
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={saving}
                      onClick={closeModal}
                      type="button"
                    >
                      Hủy
                    </button>
                    <button
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      disabled={saving}
                      type="submit"
                    >
                      {editingId ? 'Cập nhật' : 'Tạo tài khoản'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
