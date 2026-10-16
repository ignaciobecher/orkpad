import apiClient from '../axios.config'
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  PaginatedResponse,
  ProjectOverview,
  ProjectShare,
  CreateShareDto,
  UpdateShareDto,
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

  listShares: (projectId: string) =>
    apiClient.get<ProjectShare[]>(`${BASE}/${projectId}/shares`),

  createShare: (projectId: string, dto: CreateShareDto) =>
    apiClient.post<{ share: ProjectShare; password: string }>(`${BASE}/${projectId}/shares`, dto),

  updateShare: (projectId: string, shareId: string, dto: UpdateShareDto) =>
    apiClient.patch<{ share: ProjectShare; password?: string }>(`${BASE}/${projectId}/shares/${shareId}`, dto),

  regenerateShareToken: (projectId: string, shareId: string) =>
    apiClient.post<ProjectShare>(`${BASE}/${projectId}/shares/${shareId}/regenerate-token`),

  removeShare: (projectId: string, shareId: string) =>
    apiClient.delete(`${BASE}/${projectId}/shares/${shareId}`),
}
