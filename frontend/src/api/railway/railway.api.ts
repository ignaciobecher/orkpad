import apiClient from '../axios.config'
import type {
  RailwayConnection,
  RailwayProject,
  RailwayService,
  RailwayDeployment,
  RailwayProjectOverview,
  RailwayStats,
  RailwayServiceMetrics,
  RailwayProjectMetrics,
  ConnectRailwayDto,
  LinkProjectDto,
} from './railway.types'

export const railwayApi = {
  getConnection: () =>
    apiClient.get<RailwayConnection | null>('/railway/connection'),

  connect: (dto: ConnectRailwayDto) =>
    apiClient.post<RailwayConnection>('/railway/connection', dto),

  disconnect: () =>
    apiClient.delete<{ disconnected: boolean }>('/railway/connection'),

  getOverview: () =>
    apiClient.get<RailwayProjectOverview[]>('/railway/overview'),

  getStats: (days?: number) =>
    apiClient.get<RailwayStats>('/railway/stats', { params: { days } }),

  getProjects: () =>
    apiClient.get<RailwayProject[]>('/railway/projects'),

  getServices: (railwayProjectId: string) =>
    apiClient.get<RailwayService[]>(`/railway/projects/${railwayProjectId}/services`),

  getDeployments: (railwayProjectId: string) =>
    apiClient.get<RailwayDeployment[]>(`/railway/projects/${railwayProjectId}/deployments`),

  getServiceMetrics: (railwayProjectId: string, serviceId: string, hours?: number) =>
    apiClient.get<RailwayServiceMetrics>(
      `/railway/projects/${railwayProjectId}/services/${serviceId}/metrics`,
      { params: { hours } },
    ),

  getMetricsSummary: (hours?: number) =>
    apiClient.get<RailwayProjectMetrics[]>('/railway/metrics/summary', { params: { hours } }),

  linkProject: (projectId: string, dto: LinkProjectDto) =>
    apiClient.post(`/railway/link/${projectId}`, dto),

  unlinkProject: (projectId: string) =>
    apiClient.delete(`/railway/link/${projectId}`),
}
