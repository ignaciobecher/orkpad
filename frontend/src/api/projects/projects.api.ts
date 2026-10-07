import apiClient from '../axios.config'
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  PaginatedResponse,
  ProjectOverview,
} from './projects.types'

const BASE = '/projects'

export const projectsApi = {
  getAll: (params?: ProjectQueryDto) =>
    apiClient.get<PaginatedResponse<Project>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Project>(`${BASE}/${id}`),

  create: (dto: CreateProjectDto) =>
    apiClient.post<Project>(BASE, dto),

  update: (id: string, dto: UpdateProjectDto) =>
    apiClient.patch<Project>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  getOverview: (id: string) =>
    apiClient.get<ProjectOverview>(`${BASE}/${id}/overview`),

  generateInvoices: (id: string) =>
    apiClient.post<{ generated: number }>(`${BASE}/${id}/generate-invoices`),
}
