import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type PlannerBlockDocument = HydratedDocument<PlannerBlock>;

@Schema({ collection: 'planner_blocks', timestamps: true })
export class PlannerBlock extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  date: string; // 'YYYY-MM-DD'

  @Prop({ required: true })
  startTime: string; // 'HH:mm'

  @Prop({ required: true })
  endTime: string; // 'HH:mm'

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: 'work' })
  category: string;

  @Prop({ default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Prop({ default: 'pending' })
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';

  @Prop({ default: '#2563EB' })
  color: string;

  @Prop()
  icon: string;

  @Prop()
  timezone: string;

  @Prop()
  recurrenceRuleId: string;

  @Prop()
  templateId: string;

  @Prop({ default: false })
  isFocusBlock: boolean;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const PlannerBlockSchema = SchemaFactory.createForClass(PlannerBlock);

PlannerBlockSchema.index({ workspaceId: 1 });
PlannerBlockSchema.index({ workspaceId: 1, userId: 1, date: 1 });
PlannerBlockSchema.index({ workspaceId: 1, userId: 1, date: 1, status: 1 });
PlannerBlockSchema.index({ workspaceId: 1, recurrenceRuleId: 1 });
PlannerBlockSchema.index({ workspaceId: 1, createdAt: -1 });
