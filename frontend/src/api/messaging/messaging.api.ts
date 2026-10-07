import apiClient from '../axios.config'
import type {
  Conversation,
  Message,
  PaginatedConversations,
  PaginatedMessages,
  CreateConversationDto,
  CreateMessageDto,
} from './messaging.types'

const BASE = '/conversations'

export const messagingApi = {
  // ─── Admin endpoints (autenticados) ────────────────────────────────────────
  getConversations: (params?: { clientId?: string; page?: number; limit?: number }) =>
    apiClient.get<PaginatedConversations>(BASE, { params }),

  getConversation: (id: string) =>
    apiClient.get<Conversation>(`${BASE}/${id}`),

  createConversation: (dto: CreateConversationDto) =>
    apiClient.post<Conversation>(BASE, dto, { headers: { 'X-Hide-Global-Toast': 'true' } }),

  getMessages: (conversationId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedMessages>(`${BASE}/${conversationId}/messages`, { params }),

  sendAdminMessage: (conversationId: string, dto: CreateMessageDto) =>
    apiClient.post<Message>(`${BASE}/${conversationId}/messages`, dto, {
      headers: { 'X-Hide-Global-Toast': 'true' },
    }),

  markRead: (conversationId: string) =>
    apiClient.patch(`${BASE}/${conversationId}/read`, {}, {
      headers: { 'X-Hide-Global-Toast': 'true' },
    }),
}
