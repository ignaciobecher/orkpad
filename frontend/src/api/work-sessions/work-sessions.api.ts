import apiClient from '../axios.config'
import type {
  WorkSession,
  CreateWorkSessionDto,
  UpdateWorkSessionDto,
  WorkSessionQueryDto,
  PaginatedResponse,
} from './work-sessions.types'

const BASE = '/work-sessions'

export const workSessionsApi = {
  getAll: (params?: WorkSessionQueryDto) =>
    apiClient.get<PaginatedResponse<WorkSession>>(BASE, { params }),

  getActive: () =>
    apiClient.get<WorkSession | null>(`${BASE}/active`),

  start: (dto?: CreateWorkSessionDto) =>
    apiClient.post<WorkSession>(BASE, dto ?? {}),

  end: (id: string) =>
    apiClient.post<WorkSession>(`${BASE}/${id}/end`),

  update: (id: string, dto: UpdateWorkSessionDto) =>
    apiClient.patch<WorkSession>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
