export interface SocialLinks {
  website?: string
  linkedin?: string
  twitter?: string
  github?: string
}

export interface PortfolioStats {
  yearsExperience?: number
  completedProjects?: number
  happyClients?: number
}

export interface Workspace {
  _id: string
  name: string
  slug: string
  ownerId: string
  status: 'active' | 'suspended'
  bio?: string
  headline?: string
  avatarUrl?: string
  bannerUrl?: string
  publicProfile: boolean
  socialLinks: SocialLinks
  skills: string[]
  availableForWork: boolean
  availabilityNote?: string
  portfolioStats: PortfolioStats
  createdAt: string
  updatedAt: string
}

export interface UpdateWorkspaceDto {
  name?: string
  slug?: string
  bio?: string
  headline?: string
  avatarUrl?: string
  bannerUrl?: string
  publicProfile?: boolean
  socialLinks?: SocialLinks
  skills?: string[]
  availableForWork?: boolean
  availabilityNote?: string
  portfolioStats?: PortfolioStats
}
