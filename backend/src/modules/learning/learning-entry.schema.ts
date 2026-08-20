import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type LearningEntryDocument = HydratedDocument<LearningEntry>;

@Schema({ collection: 'learning-entries', timestamps: true })
export class LearningEntry extends BaseSchema {
  @Prop({ required: true })
  resourceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  date: string;

  @Prop({ default: 0 })
  unitsLogged: number;

  @Prop({ trim: true })
  note: string;

  @Prop({ default: false })
  metMinimum: boolean;
}

export const LearningEntrySchema = SchemaFactory.createForClass(LearningEntry);

LearningEntrySchema.index({ workspaceId: 1 });
LearningEntrySchema.index(
  { workspaceId: 1, resourceId: 1, date: 1 },
  { unique: true },
);
LearningEntrySchema.index({ workspaceId: 1, userId: 1, date: -1 });
