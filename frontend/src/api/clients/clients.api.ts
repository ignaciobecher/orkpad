import apiClient from '../axios.config'
import type { Client, CreateClientDto, UpdateClientDto, ClientQueryDto, PaginatedResponse } from './clients.types'

const BASE = '/clients'

export const clientsApi = {
  getAll: (params: ClientQueryDto) =>
    apiClient.get<PaginatedResponse<Client>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Client>(`${BASE}/${id}`),

  getSummary: (id: string) =>
    apiClient.get(`${BASE}/${id}/summary`),

  create: (dto: CreateClientDto) =>
    apiClient.post<Client>(BASE, dto),

  update: (id: string, dto: UpdateClientDto) =>
    apiClient.patch<Client>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
