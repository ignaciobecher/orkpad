import apiClient from '../axios.config'
import type {
  SupabaseConnection,
  SupabaseProject,
  SupabaseProjectStats,
  SupabaseProjectMetrics,
  SupabaseMetricsSummaryItem,
  ConnectSupabaseDto,
  LinkSupabaseProjectDto,
} from './supabase.types'

export const supabaseApi = {
  getConnection: () =>
    apiClient.get<SupabaseConnection>('/supabase/connection'),

  connect: (dto: ConnectSupabaseDto) =>
    apiClient.post<SupabaseConnection>('/supabase/connection', dto),

  disconnect: () =>
    apiClient.delete<{ disconnected: boolean }>('/supabase/connection'),

  listProjects: () =>
    apiClient.get<SupabaseProject[]>('/supabase/projects'),

  getProjectStats: (ref: string) =>
    apiClient.get<SupabaseProjectStats>(`/supabase/projects/${ref}/stats`),

  getProjectMetrics: (ref: string, hours?: number) =>
    apiClient.get<SupabaseProjectMetrics>(`/supabase/projects/${ref}/metrics`, {
      params: { hours },
    }),

  getMetricsSummary: (hours?: number) =>
    apiClient.get<SupabaseMetricsSummaryItem[]>('/supabase/metrics/summary', {
      params: { hours },
    }),

  linkProject: (projectId: string, dto: LinkSupabaseProjectDto) =>
    apiClient.post(`/supabase/link/${projectId}`, dto),

  unlinkProject: (projectId: string) =>
    apiClient.delete(`/supabase/link/${projectId}`),
}
