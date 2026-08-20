import apiClient from '../axios.config'
import type {
  SupportConversation,
  SupportMessage,
  PaginatedSupportMessages,
  PaginatedSupportConversations,
  CreateSupportMessageDto,
} from './support.types'

const BASE = '/support/conversation'
const ADMIN_BASE = '/admin/support'

export const supportApi = {
  // ─── Cliente (autenticado) ──────────────────────────────────────────────────
  getMyConversation: () =>
    apiClient.get<SupportConversation>(BASE),

  getMyMessages: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedSupportMessages>(`${BASE}/messages`, { params }),

  sendMyMessage: (dto: CreateSupportMessageDto) =>
    apiClient.post<SupportMessage>(`${BASE}/messages`, dto, {
      headers: { 'X-Hide-Global-Toast': 'true' },
    }),

  // ─── Admin ───────────────────────────────────────────────────────────────────
  getAllConversationsAdmin: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<PaginatedSupportConversations>(`${ADMIN_BASE}/conversations`, { params }),

  getConversationAdmin: (id: string) =>
    apiClient.get<SupportConversation>(`${ADMIN_BASE}/conversations/${id}`),

  getMessagesAdmin: (id: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedSupportMessages>(`${ADMIN_BASE}/conversations/${id}/messages`, { params }),

  sendAdminMessage: (id: string, dto: CreateSupportMessageDto) =>
    apiClient.post<SupportMessage>(`${ADMIN_BASE}/conversations/${id}/messages`, dto, {
      headers: { 'X-Hide-Global-Toast': 'true' },
    }),

  markReadAdmin: (id: string) =>
    apiClient.patch(`${ADMIN_BASE}/conversations/${id}/read`, {}, {
      headers: { 'X-Hide-Global-Toast': 'true' },
    }),

  getUnreadCountAdmin: () =>
    apiClient.get<number>(`${ADMIN_BASE}/unread-count`),
}
