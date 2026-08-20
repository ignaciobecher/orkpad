import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type OutreachActivityDocument = HydratedDocument<OutreachActivity>;

@Schema({ collection: 'outreach-activities', timestamps: true })
export class OutreachActivity extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type:
    | 'cold_email'
    | 'proposal_sent'
    | 'call_booked'
    | 'follow_up'
    | 'linkedin_message'
    | 'other';

  @Prop({ required: true, trim: true, maxlength: 150 })
  targetName: string;

  @Prop({ trim: true })
  channel: string;

  @Prop({ trim: true })
  dealId: string;

  @Prop({ trim: true })
  notes: string;

  @Prop({ required: true })
  date: string;

  @Prop({ default: 'pending' })
  outcome: 'pending' | 'replied' | 'converted' | 'no_response';
}

export const OutreachActivitySchema =
  SchemaFactory.createForClass(OutreachActivity);

OutreachActivitySchema.index({ workspaceId: 1 });
OutreachActivitySchema.index({ workspaceId: 1, userId: 1, date: -1 });
OutreachActivitySchema.index({ workspaceId: 1, userId: 1, type: 1 });
