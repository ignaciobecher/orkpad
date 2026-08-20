import apiClient from '../axios.config'
import type { InfrastructureResource, CreateInfrastructureResourceDto, UpdateInfrastructureResourceDto, InfrastructureResourceQueryDto, PaginatedResponse } from './infrastructure.types'

const BASE = '/infrastructure'

export const infrastructureApi = {
  getAll: (params?: InfrastructureResourceQueryDto) =>
    apiClient.get<PaginatedResponse<InfrastructureResource>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<InfrastructureResource>(`${BASE}/${id}`),

  create: (dto: CreateInfrastructureResourceDto) =>
    apiClient.post<InfrastructureResource>(BASE, dto),

  update: (id: string, dto: UpdateInfrastructureResourceDto) =>
    apiClient.patch<InfrastructureResource>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
