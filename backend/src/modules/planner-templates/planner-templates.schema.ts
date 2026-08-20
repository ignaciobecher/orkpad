import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type PlannerTemplateDocument = HydratedDocument<PlannerTemplate>;

@Schema({ collection: 'planner_templates', timestamps: true })
export class PlannerTemplate extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: 'day' })
  type: 'day' | 'week' | 'month';

  @Prop({ default: 'custom' })
  profession: string;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [
      {
        title: String,
        startTime: String,
        endTime: String,
        category: { type: String, default: 'work' },
        color: { type: String, default: '#2563EB' },
        icon: String,
        priority: { type: String, default: 'medium' },
        isFocusBlock: { type: Boolean, default: false },
        tags: [String],
        tasks: [
          { title: String, estimatedMinutes: { type: Number, default: 0 } },
        ],
      },
    ],
    default: [],
  })
  blocks: {
    title: string;
    startTime: string;
    endTime: string;
    category: string;
    color: string;
    icon: string;
    priority: string;
    isFocusBlock: boolean;
    tags: string[];
    tasks: { title: string; estimatedMinutes: number }[];
  }[];

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const PlannerTemplateSchema =
  SchemaFactory.createForClass(PlannerTemplate);

PlannerTemplateSchema.index({ workspaceId: 1 });
PlannerTemplateSchema.index({ workspaceId: 1, userId: 1 });
PlannerTemplateSchema.index({ workspaceId: 1, isPublic: 1 });
PlannerTemplateSchema.index({ workspaceId: 1, type: 1 });
PlannerTemplateSchema.index({ workspaceId: 1, createdAt: -1 });
