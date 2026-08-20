import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type SupportConversationDocument = HydratedDocument<SupportConversation>;

@Schema({ collection: 'support-conversations', timestamps: true })
export class SupportConversation extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: String, trim: true, default: null })
  userName: string | null;

  @Prop({ type: String, trim: true, default: null })
  userEmail: string | null;

  @Prop({ type: Date, default: null })
  lastMessageAt: Date | null;

  @Prop({ type: String, trim: true, default: null })
  lastMessagePreview: string | null;

  @Prop({ default: 0 })
  unreadCountAdmin: number;

  @Prop({ default: 0 })
  unreadCountCustomer: number;

  @Prop({ default: false })
  isClosed: boolean;
}

export const SupportConversationSchema =
  SchemaFactory.createForClass(SupportConversation);

SupportConversationSchema.index({ workspaceId: 1 });
SupportConversationSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true },
);
SupportConversationSchema.index({ workspaceId: 1, lastMessageAt: -1 });
// Cross-tenant admin inbox sort — the admin needs a single global feed across all
// customers' workspaces, which no other collection in this codebase requires.
SupportConversationSchema.index({ lastMessageAt: -1 });
