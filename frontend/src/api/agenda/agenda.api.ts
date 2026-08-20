import apiClient from '../axios.config'
import type { Event, CreateEventDto, UpdateEventDto, EventQueryDto, PaginatedResponse } from './agenda.types'

const BASE = '/agenda'

export const agendaApi = {
  getAll: (params?: EventQueryDto) =>
    apiClient.get<PaginatedResponse<Event>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Event>(`${BASE}/${id}`),

  create: (dto: CreateEventDto) =>
    apiClient.post<Event>(BASE, dto),

  update: (id: string, dto: UpdateEventDto) =>
    apiClient.patch<Event>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
