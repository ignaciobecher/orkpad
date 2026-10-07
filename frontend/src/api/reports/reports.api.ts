import apiClient from '../axios.config'

export interface ReportFilters {
  from?: string
  to?: string
  clientIds?: string[]
  projectIds?: string[]
}

export const reportsApi = {
  summary: (filters: ReportFilters) =>
    apiClient.get<any>('/reports/summary', {
      params: {
        ...filters,
        clientIds: filters.clientIds?.join(',') || undefined,
        projectIds: filters.projectIds?.join(',') || undefined,
      },
    }),

  download: (kind: 'csv' | 'pdf', filters: ReportFilters) =>
    apiClient.get(`/reports/export.${kind}`, {
      params: {
        ...filters,
        clientIds: filters.clientIds?.join(',') || undefined,
        projectIds: filters.projectIds?.join(',') || undefined,
      },
      responseType: 'blob',
    }),
}
