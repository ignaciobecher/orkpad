export interface Subscription {
  _id: string
  clientId?: string | null
  type?: 'income' | 'expense'
  planName: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'yearly'
  status: 'active' | 'past_due' | 'canceled'
  nextBillingDate: string
  lastPaymentDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface SubscriptionPayment {
  _id: string
  subscriptionId: string
  periodLabel: string
  dueDate: string
  paidAt: string | null
  status: 'pending' | 'paid'
  amount: number
  currency: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionPaymentDto {
  periodLabel: string
  dueDate: string
  amount?: number
  currency?: string
  notes?: string
}

export interface UpdateSubscriptionPaymentDto extends Partial<CreateSubscriptionPaymentDto> {
  status?: 'pending' | 'paid'
  paidAt?: string | null
}

export interface CreateSubscriptionDto {
  clientId?: string
  type?: 'income' | 'expense'
  planName: string
  nextBillingDate: string
  price?: number
  currency?: string
  billingCycle?: 'monthly' | 'yearly'
  status?: 'active' | 'past_due' | 'canceled'
}

export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {}

export interface SubscriptionQueryDto {
  page?: number
  limit?: number
  search?: string
  clientId?: string
  type?: 'income' | 'expense'
  status?: 'active' | 'past_due' | 'canceled'
  billingCycle?: 'monthly' | 'yearly'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
