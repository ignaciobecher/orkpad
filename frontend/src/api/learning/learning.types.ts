export type LearningResourceType = 'book' | 'video' | 'course' | 'article' | 'podcast'
export type LearningResourceUnit = 'pages' | 'minutes' | 'episodes' | 'chapters' | 'percent'
export type LearningResourceStatus = 'planned' | 'in_progress' | 'completed' | 'abandoned'

export interface LearningResource {
  _id: string
  title: string
  type: LearningResourceType
  author?: string
  sourceUrl?: string
  totalUnits: number | null
  unit: LearningResourceUnit
  dailyGoalUnits: number | null
  currentProgress: number
  status: LearningResourceStatus
  startedAt: string | null
  completedAt: string | null
  notes?: string
  tags: string[]
  color: string
  icon?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateLearningResourceDto {
  title: string
  type: LearningResourceType
  author?: string
  sourceUrl?: string
  totalUnits?: number
  unit?: LearningResourceUnit
  dailyGoalUnits?: number
  notes?: string
  tags?: string[]
  color?: string
  icon?: string
}

export interface UpdateLearningResourceDto extends Partial<CreateLearningResourceDto> {
  status?: LearningResourceStatus
}

export interface LearningEntry {
  _id: string
  resourceId: string
  date: string
  unitsLogged: number
  note?: string
  metMinimum: boolean
}

export interface TodayLearningProgress {
  resource: LearningResource
  unitsLoggedToday: number
  metMinimum: boolean
}

export interface SkillFocus {
  _id: string
  title: string
  category?: string
  weekStart: string
  weekEnd: string
  status: 'active' | 'completed' | 'abandoned'
  outcomeNotes?: string
  resourceIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateSkillFocusDto {
  title: string
  category?: string
  resourceIds?: string[]
}

export interface UpdateSkillFocusDto {
  title?: string
  category?: string
  status?: 'active' | 'completed' | 'abandoned'
  outcomeNotes?: string
  resourceIds?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
