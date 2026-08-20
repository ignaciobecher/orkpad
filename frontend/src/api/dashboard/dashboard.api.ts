import apiClient from '../axios.config'
import type { DashboardStats, WorkloadConstellationResponse } from './dashboard.types'

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/dashboard/stats'),
  getWorkloadConstellation: () =>
    apiClient.get<WorkloadConstellationResponse>('/dashboard/workload-constellation'),
}
