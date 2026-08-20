import type { GamificationProfile } from '../gamification/gamification.types'
import type { GoalsSummary } from '../goals/goals.types'
import type { SkillFocus, TodayLearningProgress } from '../learning/learning.types'
import type { OutreachWeeklyGoal } from '../outreach/outreach.types'

export interface GrowthSummary {
  profile: GamificationProfile
  goalsSummary: GoalsSummary
  currentFocus: SkillFocus | null
  learningToday: TodayLearningProgress[]
  outreachWeek: OutreachWeeklyGoal
}
