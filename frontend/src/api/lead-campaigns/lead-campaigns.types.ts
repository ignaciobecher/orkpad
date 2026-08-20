export type CampaignType = 'email' | 'whatsapp' | 'manual'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

export interface LeadCampaign {
  _id: string
  workspaceId: string
  name: string
  description?: string
  type: CampaignType
  template: { subject?: string; body: string }
  status: CampaignStatus
  totalSent: number
  totalOpened: number
  totalReplied: number
  scheduledAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeadCampaignDto {
  name: string
  description?: string
  type?: CampaignType
  template: { subject?: string; body: string }
}

export interface UpdateLeadCampaignDto extends Partial<CreateLeadCampaignDto> {
  status?: CampaignStatus
}
