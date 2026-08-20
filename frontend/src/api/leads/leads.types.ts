export type LeadOpportunity = 'no_website' | 'bad_seo' | 'no_social' | 'no_https' | 'outdated_web' | 'no_email'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted'
export type LeadSource = 'web' | 'manual' | 'import'
export type LeadEmailSource = 'homepage' | 'contact_page' | 'about_page' | 'inferred' | 'manual'
export type LeadEmailConfidence = 'high' | 'medium' | 'low'

export interface Lead {
  _id: string
  workspaceId: string
  name: string
  industry?: string
  email?: string
  emailSource?: LeadEmailSource
  emailConfidence?: LeadEmailConfidence
  phone?: string
  whatsapp?: string
  website?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  address?: string
  city?: string
  province?: string
  country?: string
  opportunities: LeadOpportunity[]
  score: number
  status: LeadStatus
  searchId?: string
  campaignId?: string
  lastContactedAt?: string
  source: LeadSource
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeadDto {
  name: string
  industry?: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  address?: string
  city?: string
  province?: string
  country?: string
  notes?: string
  tags?: string[]
  status?: LeadStatus
  source?: LeadSource
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {
  score?: number
}

export interface LeadQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: LeadStatus
  industry?: string
  city?: string
  searchId?: string
  source?: LeadSource
  hasEmail?: boolean
  hasWebsite?: boolean
  emailSource?: LeadEmailSource
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
