import { ArrowLeft, Calendar, Package, Save, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useCreateContractMutation } from '@/features/contracts/hooks'
import type { ContractCreatePayload } from '@/features/contracts/type'
import { formatVnd } from '@/shared/lib/format'
import { toast } from '@/shared/lib/notify'

/** Khi có API danh sách khách — điền vào đây để giống bản Remix (autofill tên/SĐT). */
const CUSTOMERS: { id: string; name: string; phone: string }[] = []

const inputClass =
  'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500'

const selectClass =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500'

function defaultEndDateIso(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

function parseMoney(s: string): number {
  return Number(String(s).replace(/\s/g, '').replace(',', '.')) || 0
}

function buildPayload(state: {
  customerId: string
  customerName: string
  customerPhone: string
  productName: string
  totalValue: string
  downPayment: string
  interestRate: string
  startDate: string
  endDate: string
  note: string
}): ContractCreatePayload {
  const total = parseMoney(state.totalValue)
  const down = parseMoney(state.downPayment)
  const product = state.productName.trim()
  if (!product) {
    throw new Error('Nhập tên phân bón / sản phẩm.')
  }
  if (total <= 0) {
    throw new Error('Tổng giá trị phải lớn hơn 0.')
  }
  const principal = Math.max(0, total - down)
  if (principal <= 0) {
    throw new Error('Nợ gốc phải lớn hơn 0 (tổng giá trị phải lớn hơn trả trước).')
  }
  const rate = parseMoney(state.interestRate)
  return {
    customerId: state.customerId.trim(),
    customerName: state.customerName.trim(),
    customerPhone: state.customerPhone.trim(),
    items: [{ productName: product, quantity: 1, unitPrice: total }],
    downPayment: down,
    interestRate: rate,
    startDate: state.startDate,
    endDate: state.endDate,
    createdBy: import.meta.env.VITE_CREATED_BY ?? 'admin',
    interestType: 'SIMPLE',
    note: state.note.trim() || undefined,
  }
}

export function ContractNewPage() {
  const navigate = useNavigate()
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const [productName, setProductName] = useState('')
  const [totalValue, setTotalValue] = useState('')
  const [downPayment, setDownPayment] = useState('')

  const [interestRate, setInterestRate] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(defaultEndDateIso)

  const [note, setNote] = useState('')

  const mutation = useCreateContractMutation()

  const principal = useMemo(
    () => Math.max(0, parseMoney(totalValue) - parseMoney(downPayment)),
    [totalValue, downPayment],
  )

  const selectedCustomer = useMemo(
    () => CUSTOMERS.find((x) => x.id === selectedCustomerId),
    [selectedCustomerId],
  )

  const displayName = selectedCustomer ? selectedCustomer.name : customerName
  const displayPhone = selectedCustomer ? selectedCustomer.phone : customerPhone

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = buildPayload({
        customerId: selectedCustomerId,
        customerName: displayName,
        customerPhone: displayPhone,
        productName,
        totalValue,
        downPayment,
        interestRate,
        startDate,
        endDate,
        note,
      })
      mutation.mutate(payload, {
        onSuccess: () => navigate('/contracts'),
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Dữ liệu không hợp lệ')
    }
  }

  function onCustomerSelect(id: string) {
    setSelectedCustomerId(id)
    if (!id) {
      setCustomerName('')
      setCustomerPhone('')
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        className="mb-6 flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
        to="/contracts"
      >
        <ArrowLeft className="size-5 shrink-0" aria-hidden />
        <span>Quay lại</span>
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">Tạo hợp đồng trả góp mới</h2>

        <form className="space-y-8" onSubmit={onSubmit}>
          {/* Thông tin khách hàng */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
              <User className="size-5 shrink-0 text-emerald-600" aria-hidden />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Chọn khách hàng có sẵn (Tùy chọn)
                </label>
                <select
                  className={selectClass}
                  onChange={(e) => onCustomerSelect(e.target.value)}
                  value={selectedCustomerId}
                >
                  <option value="">-- Nhập mới khách hàng bên dưới --</option>
                  {CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tên khách hàng</label>
                <input
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-500`}
                  disabled={Boolean(selectedCustomerId)}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  type="text"
                  value={displayName}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-500`}
                  disabled={Boolean(selectedCustomerId)}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0901234567"
                  required
                  type="tel"
                  value={displayPhone}
                />
              </div>
            </div>
          </div>

          {/* Thông tin đơn hàng */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
              <Package className="size-5 shrink-0 text-emerald-600" aria-hidden />
              Thông tin đơn hàng
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Tên phân bón</label>
                <input
                  className={inputClass}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="VD: Phân bón NPK 20-20-15 (50kg)"
                  required
                  type="text"
                  value={productName}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tổng giá trị (VNĐ)</label>
                <input
                  className={inputClass + ' tabular-nums'}
                  min={0}
                  onChange={(e) => setTotalValue(e.target.value)}
                  placeholder="15000000"
                  required
                  type="number"
                  value={totalValue}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Trả trước (VNĐ)</label>
                <input
                  className={inputClass + ' tabular-nums'}
                  min={0}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="5000000"
                  required
                  type="number"
                  value={downPayment}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nợ gốc cần trả góp</label>
                <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-semibold text-gray-700">
                  {formatVnd(principal)}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin trả góp */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
              <Calendar className="size-5 shrink-0 text-emerald-600" aria-hidden />
              Thời gian & Lãi suất (Tính theo ngày)
            </h3>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ngày mượn</label>
                <input
                  className={inputClass}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  type="date"
                  value={startDate}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ngày trả (Dự kiến)</label>
                <input
                  className={inputClass}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  type="date"
                  value={endDate}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Loại lãi suất</label>
                <select className={inputClass + ' bg-white'} defaultValue="simple">
                  <option value="simple">Lãi đơn (Tính trên nợ gốc ban đầu)</option>
                  {/* <option value="compound">Lãi kép (Tính trên dư nợ giảm dần)</option> */}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Lãi suất (% / tháng)</label>
                <input
                  className={inputClass + ' tabular-nums'}
                  min={0}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="VD: 1.5"
                  required
                  step={0.01}
                  type="number"
                  value={interestRate}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú thêm</label>
                <textarea
                  className={inputClass + ' resize-none'}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Khách hẹn sau vụ thu hoạch lúa sẽ thanh toán..."
                  rows={3}
                  value={note}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-lg font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:bg-gray-400"
              disabled={principal <= 0 || mutation.isPending}
              type="submit"
            >
              <Save className="size-5 shrink-0" aria-hidden />
              <span>{mutation.isPending ? 'Đang gửi…' : 'Tạo hợp đồng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
