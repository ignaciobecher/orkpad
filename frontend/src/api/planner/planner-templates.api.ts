import apiClient from '../axios.config'
import type {
  PlannerTemplate,
  CreatePlannerTemplateDto,
  UpdatePlannerTemplateDto,
  QueryPlannerTemplateDto,
  CaptureDayTemplateDto,
  ApplyTemplateResult,
  PaginatedResponse,
} from './planner.types'

const BASE = '/planner-templates'

export const plannerTemplatesApi = {
  getAll: (params?: QueryPlannerTemplateDto) =>
    apiClient.get<PaginatedResponse<PlannerTemplate>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<PlannerTemplate>(`${BASE}/${id}`),

  create: (dto: CreatePlannerTemplateDto) =>
    apiClient.post<PlannerTemplate>(BASE, dto),

  update: (id: string, dto: UpdatePlannerTemplateDto) =>
    apiClient.patch<PlannerTemplate>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  duplicate: (id: string) =>
    apiClient.post<PlannerTemplate>(`${BASE}/${id}/duplicate`),

  captureFromDay: (dto: CaptureDayTemplateDto) =>
    apiClient.post<PlannerTemplate>(`${BASE}/from-day`, dto),

  applyToDate: (id: string, targetDate: string) =>
    apiClient.post<ApplyTemplateResult>(`${BASE}/${id}/apply`, {}, {
      params: { targetDate },
    }),
}
