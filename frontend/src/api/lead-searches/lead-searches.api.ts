import apiClient from '../axios.config'
import type { LeadSearch, CreateLeadSearchDto, LeadSearchQueryDto, PaginatedResponse } from './lead-searches.types'

const BASE = '/lead-searches'

export const leadSearchesApi = {
  getAll: (params?: LeadSearchQueryDto) =>
    apiClient.get<PaginatedResponse<LeadSearch>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<LeadSearch>(`${BASE}/${id}`),

  create: (dto: CreateLeadSearchDto) =>
    apiClient.post<LeadSearch>(BASE, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
