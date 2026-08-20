import type { MarketingNetwork, MarketingStatus } from './marketing-shared.types'
import type { MarketingPost } from './marketing-posts.types'

export interface MonthlyMetricAverage {
  year: number
  month: number
  network: MarketingNetwork
  avgImpressions?: number
  avgViews?: number
  avgReach?: number
  avgLikes?: number
  avgComments?: number
  avgShares?: number
  count: number
}

export interface WeeklyEvolutionPoint {
  year: number
  week: number
  impressions: number
  views: number
  reach: number
}

export interface MarketingDashboardStats {
  postCountsByStatus: Record<MarketingStatus, number>
  postCountsByNetwork: Record<MarketingNetwork, number>
  upcomingThisWeek: MarketingPost[]
  bestPerformingByNetwork: Record<MarketingNetwork, MarketingPost | null>
  monthlyAverages: MonthlyMetricAverage[]
  weeklyEvolution: WeeklyEvolutionPoint[]
}
