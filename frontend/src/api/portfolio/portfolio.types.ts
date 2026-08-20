import type { PortfolioSection, PortfolioTheme, PortfolioSeo } from './portfolio-builder.types'

export interface PortfolioProfile {
  name: string
  slug: string
  bio: string | null
  headline: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  socialLinks: Record<string, string>
  skills: string[]
  availableForWork: boolean
  availabilityNote: string | null
}

export interface PortfolioStats {
  yearsExperience?: number
  completedProjects?: number
  happyClients?: number
}

export interface FeaturedProject {
  id: string
  name: string
  description?: string | null
  status: string
  startDate?: string | null
  endDate?: string | null
  coverImageUrl?: string | null
}

export interface PortfolioData {
  profile: PortfolioProfile
  stats: PortfolioStats
  services: any[]
  featuredProjects: FeaturedProject[]
  testimonials: any[]
  theme: PortfolioTheme | null
  seo: PortfolioSeo | null
  sections: PortfolioSection[] | null
  poweredBy: string
}

export interface ContactFormDto {
  name: string
  email: string
  message: string
  subject?: string
}
