import apiClient from '../axios.config'
import type {
  OutreachActivity,
  CreateOutreachActivityDto,
  UpdateOutreachActivityDto,
  OutreachWeeklyGoal,
  OutreachStats,
  PaginatedResponse,
} from './outreach.types'

const BASE = '/outreach'

export const outreachApi = {
  getActivities: (params?: { type?: string; outcome?: string; page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<OutreachActivity>>(`${BASE}/activities`, { params }),

  logActivity: (dto: CreateOutreachActivityDto) =>
    apiClient.post<OutreachActivity>(`${BASE}/activities`, dto),

  updateActivity: (id: string, dto: UpdateOutreachActivityDto) =>
    apiClient.patch<OutreachActivity>(`${BASE}/activities/${id}`, dto),

  removeActivity: (id: string) => apiClient.delete(`${BASE}/activities/${id}`),

  getCurrentWeek: () => apiClient.get<OutreachWeeklyGoal>(`${BASE}/weekly-goal/current`),

  setWeeklyTarget: (targetCount: number) =>
    apiClient.post<OutreachWeeklyGoal>(`${BASE}/weekly-goal`, { targetCount }),

  getHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<OutreachWeeklyGoal>>(`${BASE}/weekly-goal/history`, { params }),

  getStats: () => apiClient.get<OutreachStats>(`${BASE}/stats`),
}
