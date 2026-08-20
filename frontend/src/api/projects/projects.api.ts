import axios from 'axios'
import apiClient, { baseURL } from '../axios.config'
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  PaginatedResponse,
  ProjectOverview,
  PublicProjectView,
  LinkStatus,
  SetLinkCredentialDto,
} from './projects.types'

const BASE = '/projects'

const publicClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

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

  generatePublicLink: (id: string) =>
    apiClient.post<{ publicToken: string }>(`${BASE}/${id}/public-link`),

  revokePublicLink: (id: string) =>
    apiClient.delete<{ success: boolean }>(`${BASE}/${id}/public-link`),

  // ─── Link visibility & credentials (admin) ───────────────────────────────

  getLinkStatus: (id: string) =>
    apiClient.get<LinkStatus>(`${BASE}/${id}/link-status`),

  setLinkCredential: (id: string, dto: SetLinkCredentialDto) =>
    apiClient.put<{ success: boolean }>(`${BASE}/${id}/link-credential`, dto),

  removeLinkCredential: (id: string) =>
    apiClient.delete<{ success: boolean }>(`${BASE}/${id}/link-credential`),

  rotateLinkCredential: (id: string) =>
    apiClient.post<{ password: string }>(`${BASE}/${id}/link-credential/rotate`),

  // ─── Public / private client access ─────────────────────────────────────

  authLink: (token: string, dto: { username: string; password: string }) =>
    publicClient.post<{ accessToken: string }>(`/public/projects/${token}/auth`, dto),

  getPublicView: (token: string, accessToken?: string) =>
    publicClient.get<PublicProjectView>(`/public/projects/${token}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),

  createPublicTask: (token: string, dto: { title: string; description?: string }, accessToken?: string) =>
    publicClient.post<any>(`/public/projects/${token}/tasks`, dto, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),
}
