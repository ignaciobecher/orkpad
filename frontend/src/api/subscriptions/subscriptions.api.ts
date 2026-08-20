import apiClient from '../axios.config'
import type { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionQueryDto, PaginatedResponse } from './subscriptions.types'

const BASE = '/subscriptions'

export const subscriptionsApi = {
  getAll: (params?: SubscriptionQueryDto) =>
    apiClient.get<PaginatedResponse<Subscription>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Subscription>(`${BASE}/${id}`),

  create: (dto: CreateSubscriptionDto) =>
    apiClient.post<Subscription>(BASE, dto),

  update: (id: string, dto: UpdateSubscriptionDto) =>
    apiClient.patch<Subscription>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
