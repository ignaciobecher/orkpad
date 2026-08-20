export interface WorkSession {
  _id: string
  userId: string
  startTime: string
  endTime?: string | null
  notes?: string | null
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateWorkSessionDto {
  startTime?: string
  notes?: string
}

export interface UpdateWorkSessionDto {
  notes?: string
}

export interface WorkSessionQueryDto {
  page?: number
  limit?: number
  userId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
