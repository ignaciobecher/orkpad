import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type LeadCampaignDocument = HydratedDocument<LeadCampaign>;

export type CampaignType = 'email' | 'whatsapp' | 'manual';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

@Schema({ collection: 'lead_campaigns', timestamps: true })
export class LeadCampaign extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: 'email' })
  type: CampaignType;

  @Prop({
    type: {
      subject: { type: String },
      body: { type: String, required: true },
    },
    required: true,
  })
  template: { subject?: string; body: string };

  @Prop({ default: 'draft' })
  status: CampaignStatus;

  @Prop({ default: 0 })
  totalSent: number;

  @Prop({ default: 0 })
  totalOpened: number;

  @Prop({ default: 0 })
  totalReplied: number;

  @Prop({ type: Date })
  scheduledAt?: Date;
}

export const LeadCampaignSchema = SchemaFactory.createForClass(LeadCampaign);

LeadCampaignSchema.index({ workspaceId: 1 });
LeadCampaignSchema.index({ workspaceId: 1, status: 1 });
LeadCampaignSchema.index({ workspaceId: 1, createdAt: -1 });
