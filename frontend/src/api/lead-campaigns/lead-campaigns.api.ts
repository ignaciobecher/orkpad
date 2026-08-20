import apiClient from '../axios.config'
import type { LeadCampaign, CreateLeadCampaignDto, UpdateLeadCampaignDto } from './lead-campaigns.types'

const BASE = '/lead-campaigns'

export const leadCampaignsApi = {
  getAll: () =>
    apiClient.get<LeadCampaign[]>(BASE),

  getById: (id: string) =>
    apiClient.get<LeadCampaign>(`${BASE}/${id}`),

  create: (dto: CreateLeadCampaignDto) =>
    apiClient.post<LeadCampaign>(BASE, dto),

  update: (id: string, dto: UpdateLeadCampaignDto) =>
    apiClient.patch<LeadCampaign>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  sendCampaign: (id: string) =>
    apiClient.post<{ sent: number; skipped: number; channel: string; total: number }>(`${BASE}/${id}/send`),
}
