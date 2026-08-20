import type { MarketingNetwork, MarketingStatus } from './marketing-shared.types'

export interface MarketingIdea {
  _id: string
  title: string
  description: string
  networks: MarketingNetwork[]
  tags: string[]
  estimatedDate?: string | null
  status: MarketingStatus
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateMarketingIdeaDto {
  title: string
  description?: string
  networks?: MarketingNetwork[]
  tags?: string[]
  estimatedDate?: string
  status?: MarketingStatus
}

export interface UpdateMarketingIdeaDto extends Partial<CreateMarketingIdeaDto> {}

export interface MarketingIdeaQueryDto {
  page?: number
  limit?: number
  status?: MarketingStatus
  network?: MarketingNetwork
  search?: string
}

export interface MarketingIdeaKanban {
  idea: MarketingIdea[]
  borrador: MarketingIdea[]
  listo: MarketingIdea[]
  publicado: MarketingIdea[]
}
