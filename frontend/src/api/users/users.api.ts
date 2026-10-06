import apiClient from '../axios.config'
import type { PaginatedResponse, User, UserQueryDto } from './users.types'

const BASE = '/users'
const ADMIN_BASE = '/admin/users'

export const usersApi = {
  getAll: (params?: UserQueryDto) =>
    apiClient.get<PaginatedResponse<User>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<User>(`${BASE}/${id}`),

  getAllAdmin: (params?: UserQueryDto) =>
    apiClient.get<PaginatedResponse<User>>(ADMIN_BASE, { params }),

  sendFollowUp: (id: string) =>
    apiClient.post<{ message: string }>(`${ADMIN_BASE}/${id}/send-followup`),
}
