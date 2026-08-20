import apiClient from '../axios.config'
import type {
  NetlifyConnection,
  NetlifySite,
  NetlifyDeploy,
  NetlifySiteOverview,
  NetlifyStats,
  ConnectNetlifyDto,
  LinkSiteDto,
} from './netlify.types'

export const netlifyApi = {
  getConnection: () =>
    apiClient.get<NetlifyConnection | null>('/netlify/connection'),

  connect: (dto: ConnectNetlifyDto) =>
    apiClient.post<NetlifyConnection>('/netlify/connection', dto),

  disconnect: () =>
    apiClient.delete<{ disconnected: boolean }>('/netlify/connection'),

  getOverview: () =>
    apiClient.get<NetlifySiteOverview[]>('/netlify/overview'),

  getStats: (days?: number) =>
    apiClient.get<NetlifyStats>('/netlify/stats', { params: { days } }),

  getSites: () =>
    apiClient.get<NetlifySite[]>('/netlify/sites'),

  getDeployments: (siteId: string) =>
    apiClient.get<NetlifyDeploy[]>(`/netlify/sites/${siteId}/deploys`),

  linkProject: (projectId: string, dto: LinkSiteDto) =>
    apiClient.post(`/netlify/link/${projectId}`, dto),

  unlinkProject: (projectId: string) =>
    apiClient.delete(`/netlify/link/${projectId}`),
}
