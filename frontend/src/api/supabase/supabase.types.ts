export interface SupabaseConnection {
  connected: boolean
  _id?: string
  connectedAt?: string
  tokenInvalid?: boolean
  personalAccessToken?: string
  serviceRoleKey?: string
}

export interface SupabaseProject {
  ref: string
  name: string
  status: string
  region: string
  createdAt: string
  organizationId: string
}

export interface SupabaseProjectStats {
  ref: string
  name: string
  status: string
  region: string
  createdAt: string
}

export interface SupabaseMetricsSnapshot {
  snapshotAt: string
  metrics: Record<string, number>
}

export interface SupabaseProjectMetrics {
  latest: Record<string, number>
  history: SupabaseMetricsSnapshot[]
}

export interface SupabaseMetricsSummaryItem {
  orkpadProjectId: string
  orkpadProjectName: string
  supabaseProjectRef: string
  latest: Record<string, number>
}

export interface ConnectSupabaseDto {
  personalAccessToken: string
  serviceRoleKey: string
}

export interface LinkSupabaseProjectDto {
  supabaseProjectRef: string
}
