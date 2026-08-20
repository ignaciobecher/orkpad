import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type EventDocument = HydratedDocument<Event>;

@Schema({ collection: 'events', timestamps: true })
export class Event extends BaseSchema {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Date })
  startTime: Date;

  @Prop({ type: Date })
  endTime: Date;

  @Prop({ type: [String], default: [] })
  attendees: string[];

  @Prop({ default: 'meeting' })
  type: 'meeting' | 'reminder' | 'task' | 'appointment' | 'shift';

  @Prop({ default: '#5B4EFF' })
  color: string;

  @Prop({
    type: [{ entityType: String, entityId: String, title: String }],
    default: [],
  })
  links: { entityType: string; entityId: string; title: string }[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ workspaceId: 1 });
EventSchema.index({ workspaceId: 1, type: 1 });
EventSchema.index({ workspaceId: 1, startTime: 1 });
EventSchema.index({ workspaceId: 1, createdAt: -1 });
