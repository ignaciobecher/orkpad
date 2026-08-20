import apiClient from '../axios.config'
import type { PaginatedResponse } from '../projects/projects.types'
import type {
  SocialAccount,
  SocialAccountSummary,
  CreateSocialAccountDto,
  UpdateSocialAccountDto,
  SocialAccountQueryDto,
  AddWeeklyMetricDto,
  ContentPillar,
  MessageTemplate,
} from './social-identity.types'

const BASE = '/social-identity'

export const socialIdentityApi = {
  getAll: (params?: SocialAccountQueryDto) =>
    apiClient.get<PaginatedResponse<SocialAccount>>(BASE, { params }),

  getSummary: () =>
    apiClient.get<SocialAccountSummary[]>(`${BASE}/summary`),

  getById: (id: string) =>
    apiClient.get<SocialAccount>(`${BASE}/${id}`),

  create: (dto: CreateSocialAccountDto) =>
    apiClient.post<SocialAccount>(BASE, dto),

  update: (id: string, dto: UpdateSocialAccountDto) =>
    apiClient.patch<SocialAccount>(`${BASE}/${id}`, dto),

  archive: (id: string) =>
    apiClient.delete<SocialAccount>(`${BASE}/${id}`),

  addMetric: (id: string, dto: AddWeeklyMetricDto) =>
    apiClient.post<SocialAccount>(`${BASE}/${id}/metrics`, dto),

  addPillar: (id: string, dto: ContentPillar) =>
    apiClient.post<SocialAccount>(`${BASE}/${id}/pillars`, dto),

  removePillar: (id: string, pillarId: string) =>
    apiClient.delete<SocialAccount>(`${BASE}/${id}/pillars/${pillarId}`),

  addTemplate: (id: string, dto: MessageTemplate) =>
    apiClient.post<SocialAccount>(`${BASE}/${id}/templates`, dto),

  removeTemplate: (id: string, templateId: string) =>
    apiClient.delete<SocialAccount>(`${BASE}/${id}/templates/${templateId}`),

  duplicate: (id: string, platform: string, accountName: string) =>
    apiClient.post<SocialAccount>(`${BASE}/${id}/duplicate`, { platform, accountName }),
}
