import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type GamificationEventDocument = HydratedDocument<GamificationEvent>;

export type GamificationEventType =
  | 'goal_complete'
  | 'streak_milestone'
  | 'learning_entry'
  | 'resource_completed'
  | 'skill_focus_completed'
  | 'outreach_activity'
  | 'outreach_goal_complete'
  | 'badge_unlocked';

@Schema({ collection: 'gamification-events', timestamps: true })
export class GamificationEvent extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: GamificationEventType;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true })
  refId: string;

  @Prop({ required: true })
  refType: string;
}

export const GamificationEventSchema =
  SchemaFactory.createForClass(GamificationEvent);

GamificationEventSchema.index({ workspaceId: 1 });
GamificationEventSchema.index({ workspaceId: 1, userId: 1, createdAt: -1 });
GamificationEventSchema.index(
  { workspaceId: 1, refType: 1, refId: 1 },
  { unique: true },
);
