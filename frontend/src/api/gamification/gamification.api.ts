import apiClient from '../axios.config'
import type { GamificationProfile, GamificationEvent, PaginatedResponse } from './gamification.types'

const BASE = '/gamification'

export const gamificationApi = {
  getProfile: () => apiClient.get<GamificationProfile>(`${BASE}/profile`),

  getEvents: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<GamificationEvent>>(`${BASE}/events`, { params }),
}
