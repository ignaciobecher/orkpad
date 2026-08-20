import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ collection: 'messages', timestamps: true })
export class Message extends BaseSchema {
  @Prop({ required: true })
  conversationId: string;

  @Prop({ required: true, default: 'client' })
  senderType: 'admin' | 'client';

  @Prop({ type: String, default: null })
  senderId: string | null;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt: Date | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ workspaceId: 1 });
MessageSchema.index({ workspaceId: 1, conversationId: 1 });
MessageSchema.index({ workspaceId: 1, conversationId: 1, createdAt: -1 });
MessageSchema.index({ workspaceId: 1, conversationId: 1, isRead: 1 });
MessageSchema.index({ workspaceId: 1, createdAt: -1 });
