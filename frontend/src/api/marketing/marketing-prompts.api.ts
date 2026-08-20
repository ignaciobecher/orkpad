import apiClient from '../axios.config'
import type { PaginatedResponse } from '../projects/projects.types'
import type {
  MarketingPrompt,
  CreateMarketingPromptDto,
  UpdateMarketingPromptDto,
  MarketingPromptQueryDto,
} from './marketing-prompts.types'

const BASE = '/marketing/prompts'

export const marketingPromptsApi = {
  getAll: (params?: MarketingPromptQueryDto) =>
    apiClient.get<PaginatedResponse<MarketingPrompt>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<MarketingPrompt>(`${BASE}/${id}`),

  create: (dto: CreateMarketingPromptDto) =>
    apiClient.post<MarketingPrompt>(BASE, dto),

  update: (id: string, dto: UpdateMarketingPromptDto) =>
    apiClient.patch<MarketingPrompt>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
