import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type LearningResourceDocument = HydratedDocument<LearningResource>;

@Schema({ collection: 'learning-resources', timestamps: true })
export class LearningResource extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  title: string;

  @Prop({ required: true })
  type: 'book' | 'video' | 'course' | 'article' | 'podcast';

  @Prop({ trim: true })
  author: string;

  @Prop({ trim: true })
  sourceUrl: string;

  @Prop({ type: Number, default: null })
  totalUnits: number | null;

  @Prop({ default: 'pages' })
  unit: 'pages' | 'minutes' | 'episodes' | 'chapters' | 'percent';

  @Prop({ type: Number, default: null })
  dailyGoalUnits: number | null;

  @Prop({ default: 0 })
  currentProgress: number;

  @Prop({ default: 'planned' })
  status: 'planned' | 'in_progress' | 'completed' | 'abandoned';

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ trim: true })
  notes: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '#5B4EFF' })
  color: string;

  @Prop()
  icon: string;

  @Prop({ default: 0 })
  order: number;
}

export const LearningResourceSchema =
  SchemaFactory.createForClass(LearningResource);

LearningResourceSchema.index({ workspaceId: 1 });
LearningResourceSchema.index({ workspaceId: 1, userId: 1, status: 1 });
LearningResourceSchema.index({ workspaceId: 1, userId: 1, type: 1 });
