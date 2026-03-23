export type ContractRow = {
  id: string
  customerId?: string | null
  /** Tên mặt hàng dòng đầu (danh sách) */
  productName?: string | null
  customerName: string
  customerPhone: string
  totalValue: string | number
  principal: string | number
  status: string
  startDate: string
  endDate: string
  createdBy: string
}

/** Khớp JSON `InstallmentContract` từ GET `/api/v1/contracts/{id}` */
export type ContractItemRow = {
  productName: string
  quantity: number
  unitPrice: string | number
  subTotal?: string | number
}

export type PaymentRecordRow = {
  id: string
  amount: string | number
  paidAt: string
  note?: string | null
  receivedBy?: string | null
}

export type ContractDetail = {
  id: string
  customerId?: string | null
  customerName: string
  customerPhone: string
  items: ContractItemRow[]
  totalValue: string | number
  downPayment: string | number
  principal: string | number
  interestRate: string | number
  interestType: string
  status: string
  startDate: string
  endDate: string
  paymentRecords?: PaymentRecordRow[]
  note?: string | null
  createdBy: string
  createdAt?: string | null
  updatedAt?: string | null
}

export type ContractLineInput = {
  productName: string
  quantity: number
  unitPrice: string
}

export type ContractCreatePayload = {
  customerId: string
  customerName: string
  customerPhone: string
  items: { productName: string; quantity: number; unitPrice: number }[]
  downPayment: number
  interestRate: number
  startDate: string
  endDate: string
  createdBy: string
  interestType?: 'SIMPLE' | 'COMPOUND'
  note?: string
}
