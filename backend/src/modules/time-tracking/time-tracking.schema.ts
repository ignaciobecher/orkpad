import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type TimeEntryDocument = HydratedDocument<TimeEntry>;

@Schema({ collection: 'time-entries', timestamps: true })
export class TimeEntry extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop()
  projectId: string;

  @Prop()
  taskId: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date })
  endTime: Date;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ default: true })
  billable: boolean;

  @Prop({ default: 0 })
  hourlyRate: number;

  @Prop({ type: String, default: null })
  sessionId?: string | null;
}

export const TimeEntrySchema = SchemaFactory.createForClass(TimeEntry);

TimeEntrySchema.index({ workspaceId: 1, userId: 1 });
TimeEntrySchema.index({ workspaceId: 1, projectId: 1 });
TimeEntrySchema.index({ workspaceId: 1, taskId: 1 });
TimeEntrySchema.index({ workspaceId: 1, startTime: -1 });
TimeEntrySchema.index({ workspaceId: 1, billable: 1 });
TimeEntrySchema.index({ workspaceId: 1, sessionId: 1 });
