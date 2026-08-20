import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type SkillFocusDocument = HydratedDocument<SkillFocus>;

@Schema({ collection: 'skill-focuses', timestamps: true })
export class SkillFocus extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  title: string;

  @Prop({ trim: true })
  category: string;

  @Prop({ required: true, type: Date })
  weekStart: Date;

  @Prop({ required: true, type: Date })
  weekEnd: Date;

  @Prop({ default: 'active' })
  status: 'active' | 'completed' | 'abandoned';

  @Prop({ trim: true })
  outcomeNotes: string;

  @Prop({ type: [String], default: [] })
  resourceIds: string[];
}

export const SkillFocusSchema = SchemaFactory.createForClass(SkillFocus);

SkillFocusSchema.index({ workspaceId: 1 });
SkillFocusSchema.index({ workspaceId: 1, userId: 1, weekStart: -1 });
SkillFocusSchema.index({ workspaceId: 1, userId: 1, status: 1 });
