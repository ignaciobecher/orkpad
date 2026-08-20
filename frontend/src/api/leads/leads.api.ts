import apiClient from '../axios.config'
import type { Lead, CreateLeadDto, UpdateLeadDto, LeadQueryDto, PaginatedResponse } from './leads.types'

const BASE = '/leads'

export const leadsApi = {
  getAll: (params?: LeadQueryDto) =>
    apiClient.get<PaginatedResponse<Lead>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Lead>(`${BASE}/${id}`),

  create: (dto: CreateLeadDto) =>
    apiClient.post<Lead>(BASE, dto),

  update: (id: string, dto: UpdateLeadDto) =>
    apiClient.patch<Lead>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  harvestEmail: (id: string) =>
    apiClient.post<Lead>(`${BASE}/${id}/harvest-email`),
}
