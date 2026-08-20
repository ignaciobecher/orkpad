export type LeadSearchStatus = 'pending' | 'running' | 'completed' | 'failed'
export type LeadSearchSource = 'web'

export interface LeadSearchStats {
  withEmail: number
  withWebsite: number
  withPhone: number
  duplicatesSkipped: number
}

export interface LeadSearch {
  _id: string
  workspaceId: string
  query: string
  location: string
  industry?: string
  keywords: string[]
  status: LeadSearchStatus
  totalFound: number
  leadsImported: number
  maxResults: number
  sources: LeadSearchSource[]
  stats?: LeadSearchStats
  error?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeadSearchDto {
  query: string
  location: string
  industry?: string
  keywords?: string[]
  maxResults?: number
  sources?: LeadSearchSource[]
}

export interface LeadSearchQueryDto {
  page?: number
  limit?: number
  status?: LeadSearchStatus
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
