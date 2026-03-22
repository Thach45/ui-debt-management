import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

const CONFIG: Record<
  string,
  { label: string; className: string; Icon: typeof Clock }
> = {
  ACTIVE: {
    label: 'Đang vay',
    className: 'bg-blue-100 text-blue-700',
    Icon: Clock,
  },
  OVERDUE: {
    label: 'Quá hạn',
    className: 'bg-red-100 text-red-700',
    Icon: AlertCircle,
  },
  COMPLETED: {
    label: 'Đã tất toán',
    className: 'bg-emerald-100 text-emerald-700',
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-amber-100 text-amber-800',
    Icon: XCircle,
  },
}

type Props = { status: string }

export function ContractStatusBadge({ status }: Props) {
  const cfg = CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-700',
    Icon: Clock,
  }
  const Icon = cfg.Icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-tight ${cfg.className}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {cfg.label}
    </span>
  )
}
