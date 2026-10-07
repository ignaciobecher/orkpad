export interface PaymentMethod {
  _id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentMethodDto {
  name: string
  active?: boolean
}

export interface UpdatePaymentMethodDto {
  name?: string
  active?: boolean
}
