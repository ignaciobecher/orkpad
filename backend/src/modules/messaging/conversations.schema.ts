import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ collection: 'conversations', timestamps: true })
export class Conversation extends BaseSchema {
  @Prop({ required: true })
  clientId: string;

  @Prop({ type: String, default: null })
  projectId: string | null;

  @Prop({ type: Date, default: null })
  lastMessageAt: Date | null;

  @Prop({ default: 0 })
  unreadCount: number;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ workspaceId: 1 });
ConversationSchema.index({ workspaceId: 1, clientId: 1 });
ConversationSchema.index({ workspaceId: 1, projectId: 1 });
ConversationSchema.index({ workspaceId: 1, lastMessageAt: -1 });
ConversationSchema.index({ workspaceId: 1, createdAt: -1 });
