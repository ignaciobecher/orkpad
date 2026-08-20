export interface GamificationStats {
  goalsCompleted: number
  learningEntriesLogged: number
  resourcesCompleted: number
  skillFociCompleted: number
  outreachActivitiesLogged: number
}

export interface GamificationProfile {
  _id: string
  userId: string
  totalPoints: number
  level: number
  currentStreakDays: number
  bestStreakDays: number
  lastActivityDate: string | null
  badges: string[]
  stats: GamificationStats
  nextLevel: { current: number; next: number; progress: number }
}

export interface GamificationEvent {
  _id: string
  userId: string
  type: string
  points: number
  refId: string
  refType: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
