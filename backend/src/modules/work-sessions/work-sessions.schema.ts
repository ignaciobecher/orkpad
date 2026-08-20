import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type WorkSessionDocument = HydratedDocument<WorkSession>;

@Schema({ collection: 'work-sessions', timestamps: true })
export class WorkSession extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, default: null })
  endTime?: Date | null;

  @Prop({ type: String, trim: true, default: null })
  notes?: string | null;
}

export const WorkSessionSchema = SchemaFactory.createForClass(WorkSession);

WorkSessionSchema.index({ workspaceId: 1, userId: 1 });
WorkSessionSchema.index({ workspaceId: 1, startTime: -1 });
WorkSessionSchema.index(
  { workspaceId: 1, userId: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: { endTime: null },
    name: 'uniq_active_session_per_user',
  },
);
