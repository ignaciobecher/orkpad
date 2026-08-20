export interface RailwayConnection {
  connected: boolean
  _id?: string
  connectedAt?: string
  teamId?: string | null
  token?: string
  tokenInvalid?: boolean
}

export interface RailwayProject {
  id: string
  name: string
  workspaceName?: string
}

export interface RailwayService {
  id: string
  name: string
  createdAt: string
}

export interface RailwayDeploymentMeta {
  commitMessage?: string
  commitAuthor?: string
  image?: string
}

export interface RailwayDeployment {
  id: string
  status: string
  createdAt: string
  url: string | null
  meta: RailwayDeploymentMeta | null
  service: { id: string; name: string }
}

export interface RailwayProjectOverview {
  orkpadProjectId: string
  orkpadProjectName: string
  railwayProjectId: string
  services: RailwayService[]
  latestDeployment: RailwayDeployment | null
  recentDeployments: RailwayDeployment[]
}

export interface ConnectRailwayDto {
  apiToken: string
  teamId?: string
}

export interface LinkProjectDto {
  railwayProjectId: string
}

export interface RailwayStatsByStatus {
  status: string
  count: number
}

export interface RailwayStatsByDay {
  date: string
  success: number
  failed: number
  other: number
}

export interface RailwayStats {
  linkedProjectsCount: number
  activeServicesCount: number
  successRatePct: number
  failedLast24h: number
  byStatus: RailwayStatsByStatus[]
  byDay: RailwayStatsByDay[]
}

export type RailwayMetricMeasurement =
  | 'CPU_USAGE'
  | 'MEMORY_USAGE_GB'
  | 'DISK_USAGE_GB'
  | 'NETWORK_RX_GB'
  | 'NETWORK_TX_GB'

export interface RailwayMetricPoint {
  ts: number
  value: number
}

export interface RailwayMetricsSummary {
  series: Partial<Record<RailwayMetricMeasurement, RailwayMetricPoint[]>>
  latest: Partial<Record<RailwayMetricMeasurement, number>>
}

export interface RailwayServiceMetrics extends RailwayMetricsSummary {
  serviceId: string
}

export interface RailwayProjectMetrics {
  orkpadProjectId: string
  orkpadProjectName: string
  railwayProjectId: string
  services: RailwayServiceMetrics[]
}
