import type { MarketingNetwork, MarketingStatus } from './marketing-shared.types'

export type MarketingPostFormat =
  | 'carousel'
  | 'reel'
  | 'article'
  | 'image'
  | 'video'
  | 'text'
  | 'story'
  | 'poll'
  | 'event'

export interface PostMetrics {
  impressions?: number
  views?: number
  reach?: number
  likes?: number
  reactions?: number
  comments?: number
  shares?: number
  reposts?: number
  saves?: number
  clicks?: number
  profileVisits?: number
  newFollowers?: number
  avgWatchTimeSeconds?: number
  recordedAt?: string
}

export interface MarketingPost {
  _id: string
  title: string
  copyText: string
  network: MarketingNetwork
  format: MarketingPostFormat
  scheduledDate?: string | null
  status: MarketingStatus
  ideaId?: string | null
  attachmentUrl?: string | null
  analysisNotes: string
  metrics?: PostMetrics | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateMarketingPostDto {
  title: string
  copyText?: string
  network: MarketingNetwork
  format: MarketingPostFormat
  scheduledDate?: string
  status?: MarketingStatus
  ideaId?: string
  attachmentUrl?: string
  analysisNotes?: string
}

export interface UpdateMarketingPostDto extends Partial<Omit<CreateMarketingPostDto, 'network'>> {}

export interface MarketingPostQueryDto {
  page?: number
  limit?: number
  status?: MarketingStatus
  network?: MarketingNetwork
  format?: MarketingPostFormat
  ideaId?: string
  from?: string
  to?: string
}

export interface RecordMetricsDto {
  impressions?: number
  views?: number
  reach?: number
  likes?: number
  reactions?: number
  comments?: number
  shares?: number
  reposts?: number
  saves?: number
  clicks?: number
  profileVisits?: number
  newFollowers?: number
  avgWatchTimeSeconds?: number
  analysisNotes?: string
}
