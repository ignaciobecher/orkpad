import apiClient from '../axios.config'
import type {
  Goal,
  GoalEntry,
  CreateGoalDto,
  UpdateGoalDto,
  GoalQueryDto,
  QueryGoalEntriesDto,
  GoalsSummary,
  GoalStats,
  PaginatedResponse,
} from './goals.types'

const BASE = '/goals'

export const goalsApi = {
  getAll: (params?: GoalQueryDto) =>
    apiClient.get<PaginatedResponse<Goal>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Goal>(`${BASE}/${id}`),

  create: (dto: CreateGoalDto) =>
    apiClient.post<Goal>(BASE, dto),

  update: (id: string, dto: UpdateGoalDto) =>
    apiClient.patch<Goal>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  getCurrentEntry: (id: string) =>
    apiClient.get<GoalEntry>(`${BASE}/${id}/entries/current`),

  getEntries: (id: string, params?: QueryGoalEntriesDto) =>
    apiClient.get<PaginatedResponse<GoalEntry>>(`${BASE}/${id}/entries`, { params }),

  increment: (id: string, amount = 1) =>
    apiClient.post<GoalEntry>(
      `${BASE}/${id}/progress/increment`,
      { amount },
      { headers: { 'X-Hide-Global-Toast': 'true' } },
    ),

  setProgress: (id: string, currentCount: number) =>
    apiClient.put<GoalEntry>(
      `${BASE}/${id}/progress`,
      { currentCount },
      { headers: { 'X-Hide-Global-Toast': 'true' } },
    ),

  complete: (id: string) =>
    apiClient.patch<GoalEntry>(`${BASE}/${id}/progress/complete`),

  uncomplete: (id: string) =>
    apiClient.patch<GoalEntry>(`${BASE}/${id}/progress/uncomplete`),

  getSummary: () =>
    apiClient.get<GoalsSummary>(`${BASE}/summary`),

  getGoalStats: (id: string) =>
    apiClient.get<GoalStats>(`${BASE}/${id}/stats`),
}
