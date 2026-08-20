export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ─── Blocks ─────────────────────────────────────────────────────────────────

export type BlockStatus = 'pending' | 'in-progress' | 'completed' | 'skipped'
export type BlockPriority = 'low' | 'medium' | 'high'

export interface PlannerBlock {
  _id: string
  workspaceId: string
  userId: string
  date: string        // 'YYYY-MM-DD'
  startTime: string   // 'HH:mm'
  endTime: string     // 'HH:mm'
  title: string
  description?: string
  category: string
  priority: BlockPriority
  status: BlockStatus
  color: string
  icon?: string
  timezone?: string
  recurrenceRuleId?: string
  templateId?: string
  isFocusBlock: boolean
  order: number
  tags: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreatePlannerBlockDto {
  date: string
  startTime: string
  endTime: string
  title: string
  description?: string
  category?: string
  priority?: BlockPriority
  status?: BlockStatus
  color?: string
  icon?: string
  timezone?: string
  isFocusBlock?: boolean
  order?: number
  tags?: string[]
}

export interface UpdatePlannerBlockDto extends Partial<CreatePlannerBlockDto> {}

export interface QueryPlannerBlockDto {
  date?: string
  dateFrom?: string
  dateTo?: string
  status?: BlockStatus
  category?: string
  page?: number
  limit?: number
}

export interface ReorderPlannerBlocksDto {
  ids: string[]
  date: string
}

export interface CloneWeekDto {
  fromWeekStart: string
  toWeekStart: string
}

export interface UpdateBlockStatusDto {
  status: BlockStatus
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'in-progress' | 'completed'

export interface ChecklistItem {
  text: string
  completed: boolean
}

export interface TaskAttachment {
  name: string
  url: string
  type?: string
}

export interface PlannerTask {
  _id: string
  workspaceId: string
  blockId: string
  userId: string
  title: string
  completed: boolean
  completedAt?: string | null
  priority: BlockPriority
  status: TaskStatus
  estimatedMinutes: number
  actualMinutes: number
  order: number
  tags: string[]
  links: string[]
  attachments: TaskAttachment[]
  notes?: string
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface CreatePlannerTaskDto {
  blockId: string
  title: string
  priority?: BlockPriority
  status?: TaskStatus
  estimatedMinutes?: number
  order?: number
  tags?: string[]
  links?: string[]
  notes?: string
  checklist?: ChecklistItem[]
  attachments?: TaskAttachment[]
}

export interface UpdatePlannerTaskDto extends Partial<Omit<CreatePlannerTaskDto, 'blockId'>> {}

export interface QueryPlannerTaskDto {
  blockId?: string
  status?: TaskStatus
  page?: number
  limit?: number
}

export interface ReorderPlannerTasksDto {
  ids: string[]
  blockId: string
}

// ─── Templates ───────────────────────────────────────────────────────────────

export interface TemplateTask {
  title: string
  estimatedMinutes?: number
}

export interface TemplateBlock {
  title: string
  startTime: string
  endTime: string
  category?: string
  color?: string
  icon?: string
  priority?: string
  isFocusBlock?: boolean
  tags?: string[]
  tasks?: TemplateTask[]
}

export interface PlannerTemplate {
  _id: string
  workspaceId: string
  userId: string
  name: string
  description?: string
  type: 'day' | 'week' | 'month'
  profession: string
  isPublic: boolean
  isSystem: boolean
  blocks: TemplateBlock[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreatePlannerTemplateDto {
  name: string
  description?: string
  type?: 'day' | 'week' | 'month'
  profession?: string
  isPublic?: boolean
  blocks?: TemplateBlock[]
  tags?: string[]
}

export interface UpdatePlannerTemplateDto extends Partial<CreatePlannerTemplateDto> {}

export interface QueryPlannerTemplateDto {
  type?: string
  profession?: string
  includePublic?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface CaptureDayTemplateDto {
  date: string
  name: string
  description?: string
}

export interface ApplyTemplateResult {
  applied: number
  blocks: PlannerBlock[]
}
