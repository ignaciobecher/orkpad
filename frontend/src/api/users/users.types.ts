export interface User {
  _id: string
  name: string
  email: string
  workspaceId: string
  role?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface UserQueryDto {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
