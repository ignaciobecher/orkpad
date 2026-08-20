export interface Conversation {
  _id: string
  workspaceId: string
  clientId: string
  projectId: string | null
  lastMessageAt: string | null
  unreadCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  workspaceId: string
  conversationId: string
  senderType: 'admin' | 'client'
  senderId: string | null
  content: string
  isRead: boolean
  readAt: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedMessages {
  data: Message[]
  total: number
  page: number
  limit: number
}

export interface PaginatedConversations {
  data: Conversation[]
  total: number
  page: number
  limit: number
}

export interface CreateConversationDto {
  clientId: string
  projectId?: string
}

export interface CreateMessageDto {
  content: string
}
