import { Pencil, RefreshCw, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchPermissionCatalog, fetchRoles, updateRole } from '@/features/rbac/service/role-api'
import type { PermissionCatalogItem, RoleDto } from '@/features/rbac/types'
import { toast } from '@/shared/lib/notify'

const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500'

function groupByModule(items: PermissionCatalogItem[]) {
  const map = new Map<string, PermissionCatalogItem[]>()
  for (const p of items) {
    const key = p.module?.trim() || 'Khác'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'vi'))
}

export function RoleManagementTab() {
  const qc = useQueryClient()
  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  })
  const permQuery = useQuery({
    queryKey: ['permission-catalog'],
    queryFn: fetchPermissionCatalog,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RoleDto | null>(null)
  const [desc, setDesc] = useState('')
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())

  const groupedPerms = useMemo(
    () => groupByModule(permQuery.data ?? []),
    [permQuery.data],
  )

  const saveMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { description: string; permissionCodes: string[] } }) =>
      updateRole(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật vai trò')
      void qc.invalidateQueries({ queryKey: ['roles'] })
      closeModal()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function openEdit(r: RoleDto) {
    setEditing(r)
    setDesc(r.description ?? '')
    setSelectedCodes(new Set(r.permissionCodes ?? []))
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function toggleCode(code: string) {
    setSelectedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    saveMut.mutate({
      id: editing.id,
      payload: {
        description: desc.trim(),
        permissionCodes: Array.from(selectedCodes),
      },
    })
  }

  const rows = rolesQuery.data ?? []
  const loading = rolesQuery.isPending || permQuery.isPending

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Gán các mã permission (theo catalog) cho từng vai trò. Cần quyền ADMIN trên API.
        </p>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          disabled={rolesQuery.isFetching || permQuery.isFetching}
          onClick={() => {
            void qc.invalidateQueries({ queryKey: ['roles'] })
            void qc.invalidateQueries({ queryKey: ['permission-catalog'] })
          }}
          type="button"
        >
          <RefreshCw
            className={`size-4 ${rolesQuery.isFetching || permQuery.isFetching ? 'animate-spin' : ''}`}
            aria-hidden
          />
          Làm mới
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-slate-800">
            <thead>
              <tr className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-slate-950/50 dark:text-slate-400">
                <th className="px-4 py-3">Mã vai trò</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Số permission</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-500 dark:text-slate-400" colSpan={4}>
                    Đang tải…
                  </td>
                </tr>
              ) : rolesQuery.isError ? (
                <tr>
                  <td className="px-4 py-10 text-center text-red-600" colSpan={4}>
                    {rolesQuery.error instanceof Error ? rolesQuery.error.message : 'Không tải được vai trò'}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-500 dark:text-slate-400" colSpan={4}>
                    Chưa có vai trò.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-950/40" key={r.id}>
                    <td className="px-4 py-3 font-mono text-sm font-medium text-gray-900 dark:text-slate-100">
                      {r.name}
                    </td>
                    <td className="max-w-md px-4 py-3 text-gray-600 dark:text-slate-300">
                      {r.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-800 dark:text-slate-200">
                      {r.permissionCodes?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
                        onClick={() => openEdit(r)}
                        title="Sửa permission"
                        type="button"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && editing ? (
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
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Sửa vai trò: {editing.name}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Chọn mã permission từ catalog đã đồng bộ.
                </p>
              </div>
              <button
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                onClick={closeModal}
                type="button"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300" htmlFor="role-desc">
                  Mô tả
                </label>
                <textarea
                  className={inputClass}
                  id="role-desc"
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  value={desc}
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">Permission (mã)</div>
                {permQuery.isError ? (
                  <p className="text-sm text-red-600">
                    {permQuery.error instanceof Error ? permQuery.error.message : 'Không tải catalog'}
                  </p>
                ) : (
                  <div className="max-h-56 space-y-4 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                    {groupedPerms.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-slate-400">Catalog trống.</p>
                    ) : (
                      groupedPerms.map(([module, list]) => (
                        <div key={module}>
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                            {module}
                          </div>
                          <ul className="space-y-2">
                            {list.map((p) => (
                              <li key={p.id}>
                                <label className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-1 hover:bg-white dark:hover:bg-slate-900">
                                  <input
                                    checked={selectedCodes.has(p.code)}
                                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700"
                                    onChange={() => toggleCode(p.code)}
                                    type="checkbox"
                                  />
                                  <span className="text-sm">
                                    <span className="font-mono text-gray-900 dark:text-slate-100">{p.code}</span>
                                    {p.description ? (
                                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-slate-400">
                                        {p.description}
                                      </span>
                                    ) : null}
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={closeModal}
                  type="button"
                >
                  Hủy
                </button>
                <button
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  disabled={saveMut.isPending}
                  type="submit"
                >
                  {saveMut.isPending ? 'Đang lưu…' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
