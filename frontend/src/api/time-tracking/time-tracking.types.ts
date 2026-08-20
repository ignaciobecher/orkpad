export interface TimeEntry {
  _id: string
  userId: string
  projectId?: string
  taskId?: string
  description?: string
  startTime: string
  endTime?: string
  duration: number
  billable: boolean
  hourlyRate: number
  sessionId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTimeEntryDto {
  startTime: string
  projectId?: string
  taskId?: string
  description?: string
  endTime?: string
  billable?: boolean
  hourlyRate?: number
  sessionId?: string
}

export interface UpdateTimeEntryDto extends Partial<CreateTimeEntryDto> {}

export interface TimeEntryQueryDto {
  page?: number
  limit?: number
  userId?: string
  projectId?: string
  taskId?: string
  billable?: boolean
  sessionId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
