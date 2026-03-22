export type ContractRow = {
  id: string
  customerName: string
  customerPhone: string
  totalValue: string | number
  principal: string | number
  status: string
  startDate: string
  endDate: string
  createdBy: string
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
