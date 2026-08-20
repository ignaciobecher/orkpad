export interface NetlifyConnection {
  connected: boolean
  _id?: string
  connectedAt?: string
  token?: string
  tokenInvalid?: boolean
}

export interface NetlifySite {
  id: string
  name: string
  url: string
}

export interface NetlifyDeploy {
  id: string
  state: string
  branch: string | null
  createdAt: string
  deployTime: number | null
  errorMessage: string | null
}

export interface NetlifySiteOverview {
  orkpadProjectId: string
  orkpadProjectName: string
  netlifySiteId: string
  siteName: string
  siteUrl: string
  publishedDeploy: NetlifyDeploy | null
  recentDeploys: NetlifyDeploy[]
}

export interface ConnectNetlifyDto {
  apiToken: string
}

export interface LinkSiteDto {
  netlifySiteId: string
}

export interface NetlifyStatsByStatus {
  status: string
  count: number
}

export interface NetlifyStatsByDay {
  date: string
  success: number
  failed: number
  other: number
}

export interface NetlifyStats {
  linkedSitesCount: number
  activeSitesCount: number
  successRatePct: number
  failedLast24h: number
  byStatus: NetlifyStatsByStatus[]
  byDay: NetlifyStatsByDay[]
}
