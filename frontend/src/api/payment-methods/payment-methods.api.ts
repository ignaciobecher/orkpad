import apiClient from '../axios.config'
import type { PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto } from './payment-methods.types'

const BASE = '/payment-methods'

export const paymentMethodsApi = {
  getAll: (active?: boolean) =>
    apiClient.get<{ data: PaymentMethod[]; total: number }>(BASE, {
      params: active === undefined ? {} : { active },
    }),

  create: (dto: CreatePaymentMethodDto) =>
    apiClient.post<PaymentMethod>(BASE, dto),

  update: (id: string, dto: UpdatePaymentMethodDto) =>
    apiClient.patch<PaymentMethod>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
