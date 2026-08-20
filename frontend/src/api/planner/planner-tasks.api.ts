import apiClient from '../axios.config'
import type {
  PlannerTask,
  CreatePlannerTaskDto,
  UpdatePlannerTaskDto,
  QueryPlannerTaskDto,
  ReorderPlannerTasksDto,
  PaginatedResponse,
} from './planner.types'

const BASE = '/planner-tasks'

export const plannerTasksApi = {
  getAll: (params?: QueryPlannerTaskDto) =>
    apiClient.get<PaginatedResponse<PlannerTask>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<PlannerTask>(`${BASE}/${id}`),

  create: (dto: CreatePlannerTaskDto) =>
    apiClient.post<PlannerTask>(BASE, dto),

  update: (id: string, dto: UpdatePlannerTaskDto) =>
    apiClient.patch<PlannerTask>(`${BASE}/${id}`, dto),

  toggle: (id: string) =>
    apiClient.patch<PlannerTask>(`${BASE}/${id}/toggle`),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  reorder: (dto: ReorderPlannerTasksDto) =>
    apiClient.patch<PlannerTask[]>(`${BASE}/reorder`, dto),
}
