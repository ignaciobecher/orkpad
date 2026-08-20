import apiClient from '../axios.config'
import type { Task, CreateTaskDto, UpdateTaskDto, MoveTaskDto, TaskQueryDto, PaginatedResponse, CompleteTaskDto, CompleteTaskResponse } from './tasks.types'

const BASE = '/tasks'

export const tasksApi = {
  getAll: (params?: TaskQueryDto) =>
    apiClient.get<PaginatedResponse<Task>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Task>(`${BASE}/${id}`),

  create: (dto: CreateTaskDto) =>
    apiClient.post<Task>(BASE, dto),

  update: (id: string, dto: UpdateTaskDto) =>
    apiClient.patch<Task>(`${BASE}/${id}`, dto),

  move: (id: string, dto: MoveTaskDto) =>
    apiClient.patch<Task>(`${BASE}/${id}/move`, dto, { headers: { 'X-Hide-Global-Toast': 'true' } }),

  complete: (id: string, dto: CompleteTaskDto = {}) =>
    apiClient.post<CompleteTaskResponse>(`${BASE}/${id}/complete`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
