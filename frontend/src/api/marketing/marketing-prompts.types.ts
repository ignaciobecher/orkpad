import type { MarketingNetwork } from './marketing-shared.types'

export type MarketingPromptNetwork = MarketingNetwork | 'general'

export interface MarketingPrompt {
  _id: string
  name: string
  promptText: string
  network: MarketingPromptNetwork
  category: string
  tags: string[]
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateMarketingPromptDto {
  name: string
  promptText: string
  network?: MarketingPromptNetwork
  category?: string
  tags?: string[]
}

export interface UpdateMarketingPromptDto extends Partial<CreateMarketingPromptDto> {}

export interface MarketingPromptQueryDto {
  page?: number
  limit?: number
  network?: MarketingPromptNetwork
  category?: string
  search?: string
}
