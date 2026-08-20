import apiClient from '../axios.config'
import type { TimeEntry, CreateTimeEntryDto, UpdateTimeEntryDto, TimeEntryQueryDto, PaginatedResponse } from './time-tracking.types'

const BASE = '/time-entries'

export const timeTrackingApi = {
  getAll: (params?: TimeEntryQueryDto) =>
    apiClient.get<PaginatedResponse<TimeEntry>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<TimeEntry>(`${BASE}/${id}`),

  create: (dto: CreateTimeEntryDto) =>
    apiClient.post<TimeEntry>(BASE, dto),

  update: (id: string, dto: UpdateTimeEntryDto) =>
    apiClient.patch<TimeEntry>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
