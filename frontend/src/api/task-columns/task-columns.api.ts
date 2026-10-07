import apiClient from '../axios.config'
import type { TaskColumn, CreateTaskColumnDto, UpdateTaskColumnDto } from './task-columns.types'

const BASE = '/task-columns'

export const taskColumnsApi = {
  getAll: (projectId: string) =>
    apiClient.get<TaskColumn[]>(BASE, { params: { projectId } }),

  getById: (id: string) =>
    apiClient.get<TaskColumn>(`${BASE}/${id}`),

  create: (dto: CreateTaskColumnDto) =>
    apiClient.post<TaskColumn>(BASE, dto),

  update: (id: string, dto: UpdateTaskColumnDto) =>
    apiClient.patch<TaskColumn>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  reorder: (ids: string[]) =>
    apiClient.patch(`${BASE}/reorder/bulk`, { ids }),

  copy: (sourceProjectId: string, targetProjectId: string) =>
    apiClient.post<{ copied: number; columns: TaskColumn[] }>(`${BASE}/copy`, {
      sourceProjectId,
      targetProjectId,
    }),
}
