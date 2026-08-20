import apiClient from '../axios.config'
import type {
  NotificationQueryDto,
  NotificationPaginatedResponse,
  BroadcastNotificationDto,
  BroadcastNotificationResponse,
} from './notifications.types'

const BASE = '/notifications'
const ADMIN_BASE = '/admin/notifications'

export const notificationsApi = {
  getAll: (params?: NotificationQueryDto) =>
    apiClient.get<NotificationPaginatedResponse>(BASE, { params }),

  getUnreadCount: () =>
    apiClient.get<number>(`${BASE}/unread-count`),

  markAllRead: () =>
    apiClient.post(`${BASE}/mark-all-read`),

  markAsRead: (id: string) =>
    apiClient.patch(`${BASE}/${id}/read`),

  markAsUnread: (id: string) =>
    apiClient.patch(`${BASE}/${id}/unread`),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  broadcast: (dto: BroadcastNotificationDto) =>
    apiClient.post<BroadcastNotificationResponse>(`${ADMIN_BASE}/broadcast`, dto, {
      headers: { 'X-Hide-Global-Toast': 'true' },
    }),
}
