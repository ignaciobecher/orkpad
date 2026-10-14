export interface TaskAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export interface Task {
  _id: string
  title: string
  description?: string
  checklist?: { text: string; completed: boolean }[]
  labels?: { id?: string; color: string; name: string }[]
  attachments?: TaskAttachment[]
  memberIds?: string[]
  watcherIds?: string[]
  startDate?: string | null
  coverColor?: string | null
  coverAttachmentId?: string | null
  archived?: boolean
  commentsCount?: number
  projectId?: string
  assigneeId?: string
  status: 'todo' | 'in-progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  columnId?: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  checklist?: { text: string; completed: boolean }[]
  labels?: { color: string; name: string }[]
  attachments?: TaskAttachment[]
  memberIds?: string[]
  watcherIds?: string[]
  startDate?: string | null
  coverColor?: string | null
  coverAttachmentId?: string | null
  archived?: boolean
  projectId?: string
  assigneeId?: string
  status?: 'todo' | 'in-progress' | 'done' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  columnId?: string
  order?: number
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

export interface MoveTaskDto {
  columnId: string
  order?: number
}

export interface TaskQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: string
  projectId?: string
  assigneeId?: string
  memberId?: string
  priority?: string
  columnId?: string
  archived?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface CompleteTaskDto {
  sendEmail?: boolean
  completed?: boolean
}

export interface CompleteTaskResponse {
  task: Task
  project: { _id: string; name: string } | null
  client: { name: string; email: string | null; phone: string | null } | null
  whatsappText: string
  whatsappUrl: string | null
  emailSent: boolean
}

export interface TaskComment {
  _id: string
  taskId: string
  projectId?: string
  authorId: string
  authorName?: string
  text: string
  mentions?: string[]
  editedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskActivity {
  _id: string
  taskId: string
  projectId?: string
  actorId?: string
  actorName?: string
  type: string
  payload?: Record<string, any>
  createdAt: string
}
