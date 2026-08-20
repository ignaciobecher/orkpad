import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type GoalDocument = HydratedDocument<Goal>;

@Schema({ collection: 'goals', timestamps: true })
export class Goal extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  type: 'habit' | 'target' | 'checklist';

  @Prop({ required: true })
  period: 'daily' | 'weekly' | 'monthly' | 'none';

  @Prop({ required: true, default: 1, min: 1 })
  targetCount: number;

  @Prop({ trim: true })
  unit: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({ default: 'active' })
  status: 'active' | 'paused' | 'archived' | 'completed' | 'failed';

  @Prop({ default: '#5B4EFF' })
  color: string;

  @Prop()
  icon: string;

  @Prop()
  timezone: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  bestStreak: number;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);

GoalSchema.index({ workspaceId: 1 });
GoalSchema.index({ workspaceId: 1, userId: 1, status: 1 });
GoalSchema.index({ workspaceId: 1, userId: 1, type: 1 });
GoalSchema.index({ workspaceId: 1, userId: 1, dueDate: 1 });
GoalSchema.index({ workspaceId: 1, createdAt: -1 });
