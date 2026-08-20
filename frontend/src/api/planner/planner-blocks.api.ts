import apiClient from '../axios.config'
import type {
  PlannerBlock,
  CreatePlannerBlockDto,
  UpdatePlannerBlockDto,
  QueryPlannerBlockDto,
  ReorderPlannerBlocksDto,
  CloneWeekDto,
  UpdateBlockStatusDto,
  PaginatedResponse,
} from './planner.types'

const BASE = '/planner-blocks'

export const plannerBlocksApi = {
  getAll: (params?: QueryPlannerBlockDto) =>
    apiClient.get<PaginatedResponse<PlannerBlock>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<PlannerBlock>(`${BASE}/${id}`),

  create: (dto: CreatePlannerBlockDto) =>
    apiClient.post<PlannerBlock>(BASE, dto),

  update: (id: string, dto: UpdatePlannerBlockDto) =>
    apiClient.patch<PlannerBlock>(`${BASE}/${id}`, dto),

  updateStatus: (id: string, dto: UpdateBlockStatusDto) =>
    apiClient.patch<PlannerBlock>(`${BASE}/${id}/status`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  reorder: (dto: ReorderPlannerBlocksDto) =>
    apiClient.patch<PlannerBlock[]>(`${BASE}/reorder`, dto),

  duplicate: (id: string, targetDate?: string) =>
    apiClient.post<PlannerBlock>(`${BASE}/${id}/duplicate`, {}, {
      params: targetDate ? { targetDate } : undefined,
    }),

  cloneWeek: (dto: CloneWeekDto) =>
    apiClient.post<{ cloned: number }>(`${BASE}/clone-week`, dto),
}
