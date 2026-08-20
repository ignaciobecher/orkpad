export interface Event {
  _id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  attendees?: string[]
  type: 'meeting' | 'reminder' | 'task' | 'appointment' | 'shift'
  color?: string
  links?: { entityType: string; entityId: string; title?: string }[]
  createdAt: string
  updatedAt: string
}

export interface CreateEventDto {
  title: string
  description?: string
  startTime: string
  endTime?: string
  attendees?: string[]
  type?: 'meeting' | 'reminder' | 'task' | 'appointment' | 'shift'
  color?: string
  links?: { entityType: string; entityId: string; title?: string }[]
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface EventQueryDto {
  page?: number
  limit?: number
  search?: string
  type?: 'meeting' | 'reminder' | 'task' | 'appointment' | 'shift'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
