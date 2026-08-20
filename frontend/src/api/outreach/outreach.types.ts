export type OutreachActivityType =
  | 'cold_email'
  | 'proposal_sent'
  | 'call_booked'
  | 'follow_up'
  | 'linkedin_message'
  | 'other'

export type OutreachOutcome = 'pending' | 'replied' | 'converted' | 'no_response'

export interface OutreachActivity {
  _id: string
  type: OutreachActivityType
  targetName: string
  channel?: string
  dealId?: string
  notes?: string
  date: string
  outcome: OutreachOutcome
  createdAt: string
}

export interface CreateOutreachActivityDto {
  type: OutreachActivityType
  targetName: string
  channel?: string
  dealId?: string
  notes?: string
  outcome?: OutreachOutcome
}

export interface UpdateOutreachActivityDto extends Partial<CreateOutreachActivityDto> {}

export interface OutreachWeeklyGoal {
  _id: string
  weekStart: string
  weekEnd: string
  targetCount: number
  currentCount: number
  completed: boolean
}

export interface OutreachStats {
  total: number
  replied: number
  converted: number
  noResponse: number
  responseRate: number
  conversionRate: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
