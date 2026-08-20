import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ collection: 'notifications', timestamps: true })
export class Notification extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: 'info' })
  type: 'info' | 'warning' | 'success' | 'error';

  @Prop({ trim: true })
  link?: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ trim: true })
  refId?: string;

  @Prop({ trim: true })
  refType?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ workspaceId: 1 });
NotificationSchema.index({ workspaceId: 1, userId: 1 });
NotificationSchema.index({ workspaceId: 1, userId: 1, isRead: 1 });
NotificationSchema.index({ workspaceId: 1, refId: 1, refType: 1 });
NotificationSchema.index({ workspaceId: 1, createdAt: -1 });
