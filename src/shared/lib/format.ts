export function formatVnd(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(n)) return String(value)
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ'
}

/** LocalDate backend: `yyyy-MM-dd` — tránh lệch timezone khi parse `Date` */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const parts = iso.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('vi-VN').format(d)
  }
  const [y, m, d] = parts
  return new Intl.DateTimeFormat('vi-VN').format(new Date(y, m - 1, d))
}
