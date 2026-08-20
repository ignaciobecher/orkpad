export interface SupportConversation {
  _id: string
  workspaceId: string
  userId: string
  userName: string | null
  userEmail: string | null
  lastMessageAt: string | null
  lastMessagePreview: string | null
  unreadCountAdmin: number
  unreadCountCustomer: number
  isClosed: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface SupportMessage {
  _id: string
  workspaceId: string
  conversationId: string
  senderType: 'admin' | 'customer'
  senderId: string
  content: string
  isRead: boolean
  readAt: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedSupportMessages {
  data: SupportMessage[]
  total: number
  page: number
  limit: number
}

export interface PaginatedSupportConversations {
  data: SupportConversation[]
  total: number
  page: number
  limit: number
}

export interface CreateSupportMessageDto {
  content: string
}
