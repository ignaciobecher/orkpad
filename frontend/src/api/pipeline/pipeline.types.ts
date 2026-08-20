export interface Deal {
  _id: string
  title: string
  clientId?: string
  value: number
  currency: string
  stage: 'lead' | 'contacted' | 'proposal' | 'won' | 'lost'
  expectedCloseDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDealDto {
  title: string
  clientId?: string
  value?: number
  currency?: string
  stage?: 'lead' | 'contacted' | 'proposal' | 'won' | 'lost'
  expectedCloseDate?: string
}

export interface UpdateDealDto extends Partial<CreateDealDto> {}

export interface DealQueryDto {
  page?: number
  limit?: number
  search?: string
  stage?: 'lead' | 'contacted' | 'proposal' | 'won' | 'lost'
  clientId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
