export type GoalType = 'habit' | 'target' | 'checklist'
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'none'
export type GoalStatus = 'active' | 'paused' | 'archived' | 'completed' | 'failed'

export interface GoalEntry {
  _id: string
  goalId: string
  periodType: GoalPeriod
  periodKey: string
  periodStart: string
  periodEnd: string
  targetCount: number
  currentCount: number
  completed: boolean
  completedAt: string | null
}

export interface Goal {
  _id: string
  title: string
  description?: string
  type: GoalType
  period: GoalPeriod
  targetCount: number
  unit?: string
  startDate: string
  dueDate?: string | null
  status: GoalStatus
  color: string
  icon?: string
  timezone?: string
  order: number
  tags: string[]
  currentStreak: number
  bestStreak: number
  currentEntry?: GoalEntry
  createdAt: string
  updatedAt: string
}

export interface CreateGoalDto {
  title: string
  description?: string
  type: GoalType
  period: GoalPeriod
  targetCount?: number
  unit?: string
  startDate?: string
  dueDate?: string
  color?: string
  icon?: string
  timezone?: string
  tags?: string[]
}

export interface UpdateGoalDto extends Partial<CreateGoalDto> {
  status?: GoalStatus
}

export interface GoalQueryDto {
  type?: string
  status?: string
  period?: string
  page?: number
  limit?: number
}

export interface QueryGoalEntriesDto {
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface GoalsSummary {
  habitsToday: { completed: number; total: number }
  activeTargets: number
  bestStreakOverall: number
}

export interface GoalStats {
  completionRate: number
  currentStreak: number
  bestStreak: number
  totalEntries: number
  completedEntries: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
