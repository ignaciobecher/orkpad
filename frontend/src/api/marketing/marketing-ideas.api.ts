import apiClient from '../axios.config'
import type { PaginatedResponse } from '../projects/projects.types'
import type {
  MarketingIdea,
  CreateMarketingIdeaDto,
  UpdateMarketingIdeaDto,
  MarketingIdeaQueryDto,
  MarketingIdeaKanban,
} from './marketing-ideas.types'

const BASE = '/marketing/ideas'

export const marketingIdeasApi = {
  getAll: (params?: MarketingIdeaQueryDto) =>
    apiClient.get<PaginatedResponse<MarketingIdea>>(BASE, { params }),

  getKanban: () =>
    apiClient.get<MarketingIdeaKanban>(`${BASE}/kanban`),

  getById: (id: string) =>
    apiClient.get<MarketingIdea>(`${BASE}/${id}`),

  create: (dto: CreateMarketingIdeaDto) =>
    apiClient.post<MarketingIdea>(BASE, dto),

  update: (id: string, dto: UpdateMarketingIdeaDto) =>
    apiClient.patch<MarketingIdea>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
