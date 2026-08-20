import apiClient from '../axios.config'
import type { Deal, CreateDealDto, UpdateDealDto, DealQueryDto, PaginatedResponse } from './pipeline.types'

const BASE = '/pipeline'

export const pipelineApi = {
  getAll: (params?: DealQueryDto) =>
    apiClient.get<PaginatedResponse<Deal>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Deal>(`${BASE}/${id}`),

  create: (dto: CreateDealDto) =>
    apiClient.post<Deal>(BASE, dto),

  update: (id: string, dto: UpdateDealDto) =>
    apiClient.patch<Deal>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
