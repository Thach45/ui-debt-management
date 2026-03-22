import { ArrowLeft, Save, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  useCreateCustomerMutation,
  useCustomerDetailQuery,
  useUpdateCustomerMutation,
} from '@/features/customers/hooks'
import type { CustomerRow, CustomerTier } from '@/features/customers/type'

const inputClass =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500'

const TIERS: { value: CustomerTier; label: string }[] = [
  { value: 'STANDARD', label: 'Tiêu chuẩn' },
  { value: 'REGULAR', label: 'Thân thiết' },
  { value: 'VIP', label: 'VIP' },
]

function CustomerNewForm() {
  const navigate = useNavigate()
  const createMutation = useCreateCustomerMutation()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [farmingLocation, setFarmingLocation] = useState('')
  const [customerTier, setCustomerTier] = useState<CustomerTier>('STANDARD')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
      farmingLocation: farmingLocation.trim() || undefined,
      customerTier,
    }
    if (!payload.name || !payload.phone) return
    createMutation.mutate(payload, {
      onSuccess: () => navigate('/customers', { replace: true }),
    })
  }

  return (
    <CustomerFormFields
      busy={createMutation.isPending}
      onSubmit={onSubmit}
      setAddress={setAddress}
      setCustomerTier={setCustomerTier}
      setFarmingLocation={setFarmingLocation}
      setName={setName}
      setPhone={setPhone}
      state={{ name, phone, address, farmingLocation, customerTier }}
      title="Thêm khách hàng"
    />
  )
}

function CustomerEditForm({ customer }: { customer: CustomerRow }) {
  const navigate = useNavigate()
  const updateMutation = useUpdateCustomerMutation()

  const [name, setName] = useState(customer.name)
  const [phone, setPhone] = useState(customer.phone)
  const [address, setAddress] = useState(customer.address ?? '')
  const [farmingLocation, setFarmingLocation] = useState(customer.farmingLocation ?? '')
  const [customerTier, setCustomerTier] = useState<CustomerTier>(customer.customerTier)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
      farmingLocation: farmingLocation.trim() || undefined,
      customerTier,
    }
    if (!payload.name || !payload.phone) return
    updateMutation.mutate(
      { id: customer.id, payload },
      { onSuccess: () => navigate('/customers', { replace: true }) },
    )
  }

  return (
    <CustomerFormFields
      busy={updateMutation.isPending}
      onSubmit={onSubmit}
      setAddress={setAddress}
      setCustomerTier={setCustomerTier}
      setFarmingLocation={setFarmingLocation}
      setName={setName}
      setPhone={setPhone}
      state={{ name, phone, address, farmingLocation, customerTier }}
      title="Sửa khách hàng"
    />
  )
}

type FormState = {
  name: string
  phone: string
  address: string
  farmingLocation: string
  customerTier: CustomerTier
}

function CustomerFormFields({
  title,
  state,
  setName,
  setPhone,
  setAddress,
  setFarmingLocation,
  setCustomerTier,
  onSubmit,
  busy,
}: {
  title: string
  state: FormState
  setName: (v: string) => void
  setPhone: (v: string) => void
  setAddress: (v: string) => void
  setFarmingLocation: (v: string) => void
  setCustomerTier: (v: CustomerTier) => void
  onSubmit: (e: React.FormEvent) => void
  busy: boolean
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-8 text-left md:px-6">
      <Link
        className="mb-5 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
        to="/customers"
      >
        <ArrowLeft className="size-5" aria-hidden />
        <span>Quay lại danh sách</span>
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">{title}</h1>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <User className="size-5 text-emerald-600" aria-hidden />
              Thông tin
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Họ tên</label>
                <input
                  className={inputClass}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  value={state.name}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  className={inputClass + ' tabular-nums'}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  required
                  type="tel"
                  value={state.phone}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Địa chỉ</label>
                <input
                  className={inputClass}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Thôn / xã / huyện"
                  value={state.address}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Vùng canh tác / trồng trọt
                </label>
                <input
                  className={inputClass}
                  onChange={(e) => setFarmingLocation(e.target.value)}
                  placeholder="VD: Ruộng lúa xã A"
                  value={state.farmingLocation}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Hạng khách</label>
                <select
                  className={inputClass + ' bg-white'}
                  onChange={(e) => setCustomerTier(e.target.value as CustomerTier)}
                  value={state.customerTier}
                >
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:bg-gray-400"
              disabled={busy}
              type="submit"
            >
              <Save className="size-5" aria-hidden />
              {busy ? 'Đang lưu…' : title.startsWith('Sửa') ? 'Cập nhật' : 'Tạo khách hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { data: existing, isPending, isError, error } = useCustomerDetailQuery(id)

  if (!isEdit) {
    return <CustomerNewForm />
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 text-center text-sm text-gray-500 md:px-6">
        Đang tải thông tin khách…
      </div>
    )
  }

  if (isError || !existing) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 md:px-6">
        <p className="text-center text-sm text-red-600">
          {error instanceof Error ? error.message : 'Không tải được khách hàng'}
        </p>
        <div className="mt-4 text-center">
          <Link className="text-emerald-600 hover:underline" to="/customers">
            Về danh sách
          </Link>
        </div>
      </div>
    )
  }

  return <CustomerEditForm customer={existing} />
}
