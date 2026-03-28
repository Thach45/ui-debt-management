export type ContractRow = {
  id: string
  customerId?: string | null
  /** Tên mặt hàng dòng đầu (danh sách) */
  productName?: string | null
  customerName: string
  customerPhone: string
  totalValue: string | number
  downPayment?: string | number
  /** Gốc ban đầu */
  principal: string | number
  /** Gốc còn lại (backend: phân bổ lãi trước) */
  remainingPrincipal?: string | number
  /** Lãi còn lại (cùng quy tắc với remainingPrincipal) */
  remainingInterest?: string | number
  interestRate?: string | number
  interestType?: string
  status: string
  startDate: string
  endDate: string
  createdBy: string
  totalDays?: number
  interestPerDay?: string | number
  totalInterest?: string | number
  totalPaid?: string | number
  totalExpected?: string | number
  remainingAmount?: string | number
  loanStatus?: 'active' | 'overdue' | 'completed' | string
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
  /** Phần quy vào lãi (kỳ này) */
  appliedToInterest?: string | number
  /** Phần quy vào gốc (kỳ này) */
  appliedToPrincipal?: string | number
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
  remainingPrincipal?: string | number
  remainingInterest?: string | number
  interestRate: string | number
  interestType: string
  status: string
  startDate: string
  endDate: string
  totalDays: number
  interestPerDay: string | number
  totalInterest: string | number
  totalPaid: string | number
  totalExpected: string | number
  remainingAmount: string | number
  loanStatus: 'active' | 'overdue' | 'completed' | string
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

/** POST `/api/v1/payments/collect` */
export type PaymentCollectPayload = {
  contractId: string
  amount: number
  note?: string | null
  receivedBy?: string | null
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
