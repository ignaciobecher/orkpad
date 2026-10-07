import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type AiMessageDocument = HydratedDocument<AiMessage>;

@Schema({ collection: 'ai_messages', timestamps: true })
export class AiMessage extends BaseSchema {
  @Prop({ required: true })
  conversationId: string;

  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Prop({ required: true })
  content: string;

  @Prop({ type: [{ refType: String, refId: String, title: String, chunk: String }], default: [] })
  sources: { refType: string; refId: string; title?: string; chunk?: string }[];
}

export const AiMessageSchema = SchemaFactory.createForClass(AiMessage);

AiMessageSchema.index({ workspaceId: 1, conversationId: 1, createdAt: 1 });
