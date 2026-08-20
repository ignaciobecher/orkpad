import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type MarketingIdeaDocument = HydratedDocument<MarketingIdea>;

@Schema({ collection: 'marketing_ideas', timestamps: true })
export class MarketingIdea extends BaseSchema {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: [String], default: [] })
  networks: ('linkedin' | 'instagram' | 'tiktok')[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Date, default: null })
  estimatedDate: Date | null;

  @Prop({ default: 'idea' })
  status: 'idea' | 'borrador' | 'listo' | 'publicado';

  @Prop({ required: true })
  userId: string;
}

export const MarketingIdeaSchema = SchemaFactory.createForClass(MarketingIdea);

MarketingIdeaSchema.index({ workspaceId: 1 });
MarketingIdeaSchema.index({ workspaceId: 1, status: 1 });
MarketingIdeaSchema.index({ workspaceId: 1, createdAt: -1 });
MarketingIdeaSchema.index({ workspaceId: 1, networks: 1 });
