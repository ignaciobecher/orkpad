import apiClient from '../axios.config'
import type {
  LearningResource,
  CreateLearningResourceDto,
  UpdateLearningResourceDto,
  LearningEntry,
  TodayLearningProgress,
  SkillFocus,
  CreateSkillFocusDto,
  UpdateSkillFocusDto,
  PaginatedResponse,
} from './learning.types'

const BASE = '/learning'

export const learningApi = {
  getResources: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<LearningResource>>(`${BASE}/resources`, { params }),

  getTodayProgress: () => apiClient.get<TodayLearningProgress[]>(`${BASE}/resources/today`),

  getResource: (id: string) => apiClient.get<LearningResource>(`${BASE}/resources/${id}`),

  getEntries: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<LearningEntry>>(`${BASE}/resources/${id}/entries`, { params }),

  createResource: (dto: CreateLearningResourceDto) =>
    apiClient.post<LearningResource>(`${BASE}/resources`, dto),

  logProgress: (id: string, unitsLogged: number, note?: string) =>
    apiClient.post<LearningResource>(`${BASE}/resources/${id}/log-progress`, { unitsLogged, note }),

  updateResource: (id: string, dto: UpdateLearningResourceDto) =>
    apiClient.patch<LearningResource>(`${BASE}/resources/${id}`, dto),

  removeResource: (id: string) => apiClient.delete(`${BASE}/resources/${id}`),

  getCurrentFocus: () => apiClient.get<SkillFocus | null>(`${BASE}/skill-focus/current`),

  getFocusHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<SkillFocus>>(`${BASE}/skill-focus/history`, { params }),

  setWeeklyFocus: (dto: CreateSkillFocusDto) => apiClient.post<SkillFocus>(`${BASE}/skill-focus`, dto),

  updateFocus: (id: string, dto: UpdateSkillFocusDto) =>
    apiClient.patch<SkillFocus>(`${BASE}/skill-focus/${id}`, dto),
}
