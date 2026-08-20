import apiClient from '../axios.config'
import type {
  SubscriptionPayment,
  CreateSubscriptionPaymentDto,
  UpdateSubscriptionPaymentDto,
} from './subscriptions.types'

const base = (subscriptionId: string) => `/subscriptions/${subscriptionId}/payments`

export const subscriptionPaymentsApi = {
  getBySubscription: (subscriptionId: string) =>
    apiClient.get<SubscriptionPayment[]>(base(subscriptionId)),

  create: (subscriptionId: string, dto: CreateSubscriptionPaymentDto) =>
    apiClient.post<SubscriptionPayment>(base(subscriptionId), dto),

  markPaid: (subscriptionId: string, paymentId: string) =>
    apiClient.patch<SubscriptionPayment>(`${base(subscriptionId)}/${paymentId}/mark-paid`),

  markPending: (subscriptionId: string, paymentId: string) =>
    apiClient.patch<SubscriptionPayment>(`${base(subscriptionId)}/${paymentId}/mark-pending`),

  update: (subscriptionId: string, paymentId: string, dto: UpdateSubscriptionPaymentDto) =>
    apiClient.patch<SubscriptionPayment>(`${base(subscriptionId)}/${paymentId}`, dto),

  remove: (subscriptionId: string, paymentId: string) =>
    apiClient.delete(`${base(subscriptionId)}/${paymentId}`),
}
