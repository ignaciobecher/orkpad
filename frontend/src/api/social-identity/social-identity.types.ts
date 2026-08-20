export type SocialPlatform = 'tiktok' | 'linkedin' | 'instagram' | 'twitter' | 'youtube' | 'email'
export type SocialPurpose = 'clients' | 'founders' | 'devs' | 'saas' | 'mixed'
export type SocialAccountStatus = 'active' | 'paused' | 'archived'

export interface SocialAccountIdentity {
  bio?: string
  profilePhoto?: string
  bannerDescription?: string
  linkInBio?: string
  positioning?: string
  uniqueAngle?: string
}

export interface SocialAccountAudience {
  primaryProfile?: string
  ageRange?: string
  painPoints?: string[]
  desires?: string[]
  whereLive?: string[]
  notFor?: string[]
}

export interface ContentPillar {
  _id?: string
  name: string
  description?: string
  frequency?: string
  examples?: string[]
  callToAction?: string
}

export interface StyleRules {
  doList?: string[]
  dontList?: string[]
  toneWords?: string[]
  format?: string
  videoStyle?: string
  postLength?: string
}

export interface MessageTemplate {
  _id?: string
  name: string
  type: string
  subject?: string
  body: string
  variables?: string[]
  useCase?: string
  followUpDays?: number
}

export interface Prospecting {
  weeklyGoal?: number
  targetIndustries?: string[]
  targetRoles?: string[]
  targetCities?: string[]
  qualificationCriteria?: string[]
  disqualificationCriteria?: string[]
  searchStrategy?: string
  conversionGoal?: string
}

export interface WeeklyMetric {
  weekNumber: number
  year: number
  postsPublished: number
  connectionsRequested?: number
  messagesSent: number
  responsesReceived: number
  callsBooked: number
  clientsClosed: number
  topPerformingPost?: string
  notes?: string
  recordedAt: string
}

export interface SocialAccount {
  _id: string
  accountName: string
  platform: SocialPlatform
  handle: string
  purpose: SocialPurpose
  purposeDescription?: string
  identity?: SocialAccountIdentity | null
  audience?: SocialAccountAudience | null
  contentPillars: ContentPillar[]
  styleRules?: StyleRules | null
  messageTemplates: MessageTemplate[]
  prospecting?: Prospecting | null
  weeklyMetrics: WeeklyMetric[]
  status: SocialAccountStatus
  followersCount: number
  color?: string
  emoji?: string
  createdAt: string
  updatedAt: string
}

export interface SocialAccountSummary {
  id: string
  accountName: string
  platform: SocialPlatform
  handle: string
  purpose: SocialPurpose
  status: SocialAccountStatus
  followersCount: number
  color?: string
  emoji?: string
  lastWeekMetrics: WeeklyMetric | null
  pillarsCount: number
  templatesCount: number
}

export interface CreateSocialAccountDto {
  accountName: string
  platform: SocialPlatform
  handle: string
  purpose: SocialPurpose
  purposeDescription?: string
  identity?: SocialAccountIdentity
  audience?: SocialAccountAudience
  contentPillars?: ContentPillar[]
  styleRules?: StyleRules
  messageTemplates?: MessageTemplate[]
  prospecting?: Prospecting
  color?: string
  emoji?: string
}

export interface UpdateSocialAccountDto extends Partial<CreateSocialAccountDto> {}

export interface SocialAccountQueryDto {
  platform?: SocialPlatform
  purpose?: SocialPurpose
  status?: SocialAccountStatus
  page?: number
  limit?: number
}

export interface AddWeeklyMetricDto {
  weekNumber: number
  year: number
  postsPublished: number
  connectionsRequested?: number
  messagesSent: number
  responsesReceived: number
  callsBooked: number
  clientsClosed: number
  topPerformingPost?: string
  notes?: string
}
