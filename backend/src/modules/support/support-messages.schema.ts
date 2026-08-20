import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type SupportMessageDocument = HydratedDocument<SupportMessage>;

@Schema({ collection: 'support-messages', timestamps: true })
export class SupportMessage extends BaseSchema {
  @Prop({ required: true })
  conversationId: string;

  @Prop({ required: true, default: 'customer' })
  senderType: 'admin' | 'customer';

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt: Date | null;
}

export const SupportMessageSchema =
  SchemaFactory.createForClass(SupportMessage);

SupportMessageSchema.index({ workspaceId: 1 });
SupportMessageSchema.index({ workspaceId: 1, conversationId: 1 });
SupportMessageSchema.index({
  workspaceId: 1,
  conversationId: 1,
  createdAt: -1,
});
SupportMessageSchema.index({
  workspaceId: 1,
  conversationId: 1,
  isRead: 1,
  senderType: 1,
});
