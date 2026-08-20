export interface Notification {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryDto {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface NotificationPaginatedResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface BroadcastNotificationDto {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
}

export interface BroadcastNotificationResponse {
  sent: number;
  total: number;
}
