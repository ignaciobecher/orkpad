import apiClient from '../axios.config'
import type { Task, CreateTaskDto, UpdateTaskDto, MoveTaskDto, TaskQueryDto, PaginatedResponse, CompleteTaskDto, CompleteTaskResponse, TaskComment, TaskActivity } from './tasks.types'

const BASE = '/tasks'
const HIDE_TOAST = { headers: { 'X-Hide-Global-Toast': 'true' } }

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
    apiClient.patch<Task>(`${BASE}/${id}/move`, dto, HIDE_TOAST),

  duplicate: (id: string) =>
    apiClient.post<Task>(`${BASE}/${id}/duplicate`),

  addAttachment: (id: string, file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<{ task: Task; file: any }>(`${BASE}/${id}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
  },

  removeAttachment: (id: string, fileId: string) =>
    apiClient.delete<Task>(`${BASE}/${id}/attachments/${fileId}`),

  complete: (id: string, dto: CompleteTaskDto = {}) =>
    apiClient.post<CompleteTaskResponse>(`${BASE}/${id}/complete`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  // Comentarios
  listComments: (taskId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<TaskComment>>(`${BASE}/${taskId}/comments`, { params: { ...params }, ...HIDE_TOAST }),

  addComment: (taskId: string, dto: { text: string; mentions?: string[] }) =>
    apiClient.post<TaskComment>(`${BASE}/${taskId}/comments`, dto),

  updateComment: (taskId: string, commentId: string, dto: { text: string }) =>
    apiClient.patch<TaskComment>(`${BASE}/${taskId}/comments/${commentId}`, dto, HIDE_TOAST),

  removeComment: (taskId: string, commentId: string) =>
    apiClient.delete(`${BASE}/${taskId}/comments/${commentId}`, HIDE_TOAST),

  // Actividad
  listActivities: (taskId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<TaskActivity>>(`${BASE}/${taskId}/activities`, { params: { ...params }, ...HIDE_TOAST }),
}
