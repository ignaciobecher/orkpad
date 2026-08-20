import apiClient from '../axios.config'
import type { SubscribePushDto, VapidPublicKeyResponse } from './push-subscriptions.types'

const BASE = '/push-subscriptions'

export const pushSubscriptionsApi = {
  getVapidPublicKey: () =>
    apiClient.get<VapidPublicKeyResponse>(`${BASE}/vapid-public-key`),

  subscribe: (dto: SubscribePushDto) =>
    apiClient.post(`${BASE}`, dto),

  unsubscribe: (endpoint: string) =>
    apiClient.delete(`${BASE}`, { data: { endpoint } }),
}
