import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type AiConversationDocument = HydratedDocument<AiConversation>;

@Schema({ collection: 'ai_conversations', timestamps: true })
export class AiConversation extends BaseSchema {
  @Prop({ trim: true, maxlength: 120, default: 'Nueva conversación' })
  title: string;

  @Prop({ type: String, default: null })
  projectId: string | null;

  @Prop({ required: true })
  userId: string;
}

export const AiConversationSchema = SchemaFactory.createForClass(AiConversation);

AiConversationSchema.index({ workspaceId: 1, userId: 1, updatedAt: -1 });
