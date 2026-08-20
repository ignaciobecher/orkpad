import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type OutreachWeeklyGoalDocument = HydratedDocument<OutreachWeeklyGoal>;

@Schema({ collection: 'outreach-weekly-goals', timestamps: true })
export class OutreachWeeklyGoal extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: Date })
  weekStart: Date;

  @Prop({ required: true, type: Date })
  weekEnd: Date;

  @Prop({ required: true, default: 10, min: 1 })
  targetCount: number;

  @Prop({ default: 0 })
  currentCount: number;

  @Prop({ default: false })
  completed: boolean;
}

export const OutreachWeeklyGoalSchema =
  SchemaFactory.createForClass(OutreachWeeklyGoal);

OutreachWeeklyGoalSchema.index({ workspaceId: 1 });
OutreachWeeklyGoalSchema.index(
  { workspaceId: 1, userId: 1, weekStart: 1 },
  { unique: true },
);
