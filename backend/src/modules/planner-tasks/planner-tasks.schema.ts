import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type PlannerTaskDocument = HydratedDocument<PlannerTask>;

@Schema({ collection: 'planner_tasks', timestamps: true })
export class PlannerTask extends BaseSchema {
  @Prop({ required: true })
  blockId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Prop({ default: 'pending' })
  status: 'pending' | 'in-progress' | 'completed';

  @Prop({ default: 0 })
  estimatedMinutes: number;

  @Prop({ default: 0 })
  actualMinutes: number;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  links: string[];

  @Prop({
    type: [{ name: String, url: String, type: String }],
    default: [],
  })
  attachments: { name: string; url: string; type: string }[];

  @Prop({ trim: true })
  notes: string;

  @Prop({
    type: [{ text: String, completed: { type: Boolean, default: false } }],
    default: [],
  })
  checklist: { text: string; completed: boolean }[];
}

export const PlannerTaskSchema = SchemaFactory.createForClass(PlannerTask);

PlannerTaskSchema.index({ workspaceId: 1 });
PlannerTaskSchema.index({ workspaceId: 1, blockId: 1 });
PlannerTaskSchema.index({ workspaceId: 1, userId: 1, status: 1 });
PlannerTaskSchema.index({ workspaceId: 1, blockId: 1, order: 1 });
