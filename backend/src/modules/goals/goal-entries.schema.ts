import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type GoalEntryDocument = HydratedDocument<GoalEntry>;

@Schema({ collection: 'goal-entries', timestamps: true })
export class GoalEntry extends BaseSchema {
  @Prop({ required: true })
  goalId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  periodType: 'daily' | 'weekly' | 'monthly' | 'none';

  @Prop({ required: true })
  periodKey: string;

  @Prop({ required: true, type: Date })
  periodStart: Date;

  @Prop({ required: true, type: Date })
  periodEnd: Date;

  @Prop({ required: true, min: 1 })
  targetCount: number;

  @Prop({ default: 0, min: 0 })
  currentCount: number;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;
}

export const GoalEntrySchema = SchemaFactory.createForClass(GoalEntry);

GoalEntrySchema.index({ workspaceId: 1 });
GoalEntrySchema.index(
  { workspaceId: 1, goalId: 1, periodKey: 1 },
  { unique: true },
);
GoalEntrySchema.index({ workspaceId: 1, userId: 1, periodStart: -1 });
GoalEntrySchema.index({
  workspaceId: 1,
  userId: 1,
  periodType: 1,
  completed: 1,
});
