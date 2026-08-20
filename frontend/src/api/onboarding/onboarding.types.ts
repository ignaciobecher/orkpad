export interface OnboardingSteps {
  addedFirstClient: boolean
  addedFirstProject: boolean
  addedThreeTasks: boolean
  loggedFirstHours: boolean
}

export interface OnboardingChecklistItem {
  id: keyof OnboardingSteps
  order: number
  completed: boolean
  title: string
  description: string
  cta: { label: string; route: string }
}

export interface OnboardingStatus {
  completed: boolean
  steps: OnboardingSteps
  completedCount: number
  totalCount: 4
  checklist: OnboardingChecklistItem[]
}

export interface WelcomePillar {
  id: string
  title: string
  description: string
  icon: string
  route: string
}

export interface WelcomeContent {
  headline: string
  pillars: WelcomePillar[]
}

export interface SeedDemoDataResponse {
  alreadySeeded: boolean
  client?: unknown
  project?: unknown
  tasks?: unknown[]
}

export interface ClearDemoDataResponse {
  removed: number
}
