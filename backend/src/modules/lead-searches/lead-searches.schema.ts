import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type LeadSearchDocument = HydratedDocument<LeadSearch>;

export type LeadSearchStatus = 'pending' | 'running' | 'completed' | 'failed';

@Schema({ collection: 'lead_searches', timestamps: true })
export class LeadSearch extends BaseSchema {
  @Prop({ required: true, trim: true })
  query: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ trim: true })
  industry?: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ default: 'pending' })
  status: LeadSearchStatus;

  @Prop({ default: 0 })
  totalFound: number;

  @Prop({ default: 0 })
  leadsImported: number;

  @Prop({ default: 20 })
  maxResults: number;

  @Prop({ type: [String], default: ['google_maps'] })
  sources: ('google_maps' | 'web')[];

  @Prop({ trim: true })
  error?: string;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;
}

export const LeadSearchSchema = SchemaFactory.createForClass(LeadSearch);

LeadSearchSchema.index({ workspaceId: 1 });
LeadSearchSchema.index({ workspaceId: 1, status: 1 });
LeadSearchSchema.index({ workspaceId: 1, createdAt: -1 });
