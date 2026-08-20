import apiClient from '../axios.config'
import type { PaginatedResponse } from '../projects/projects.types'
import type {
  MarketingPost,
  CreateMarketingPostDto,
  UpdateMarketingPostDto,
  MarketingPostQueryDto,
  RecordMetricsDto,
} from './marketing-posts.types'
import type { MarketingDashboardStats } from './marketing-dashboard.types'
import type { PreviewImportResponse, ImportPostsDto } from './marketing-import.types'

const BASE = '/marketing/posts'

export const marketingPostsApi = {
  getAll: (params?: MarketingPostQueryDto) =>
    apiClient.get<PaginatedResponse<MarketingPost>>(BASE, { params }),

  getCalendar: (from: string, to: string, network?: string) =>
    apiClient.get<MarketingPost[]>(`${BASE}/calendar`, { params: { from, to, network } }),

  getDashboard: () =>
    apiClient.get<MarketingDashboardStats>(`${BASE}/dashboard`),

  getById: (id: string) =>
    apiClient.get<MarketingPost>(`${BASE}/${id}`),

  create: (dto: CreateMarketingPostDto) =>
    apiClient.post<MarketingPost>(BASE, dto),

  update: (id: string, dto: UpdateMarketingPostDto) =>
    apiClient.patch<MarketingPost>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  recordMetrics: (id: string, dto: RecordMetricsDto) =>
    apiClient.post<MarketingPost>(`${BASE}/${id}/metrics`, dto),

  getImportTemplate: () =>
    apiClient.get(`${BASE}/import/template`, { responseType: 'blob' }),

  previewImport: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<PreviewImportResponse>(`${BASE}/import/preview`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  confirmImport: (dto: ImportPostsDto) =>
    apiClient.post(`${BASE}/import/confirm`, dto),
}
