import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type AiEmbeddingDocument = HydratedDocument<AiEmbedding>;

@Schema({ collection: 'ai_embeddings', timestamps: true })
export class AiEmbedding extends BaseSchema {
  @Prop({ required: true })
  refType: string;

  @Prop({ required: true })
  refId: string;

  @Prop({ type: String, default: null })
  projectId: string | null;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  chunk: string;

  @Prop({ type: [Number], default: [] })
  embedding: number[];
}

export const AiEmbeddingSchema = SchemaFactory.createForClass(AiEmbedding);

AiEmbeddingSchema.index({ workspaceId: 1, refType: 1, refId: 1 });
AiEmbeddingSchema.index({ workspaceId: 1, projectId: 1 });
