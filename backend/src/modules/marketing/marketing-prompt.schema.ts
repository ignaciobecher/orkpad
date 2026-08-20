import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type MarketingPromptDocument = HydratedDocument<MarketingPrompt>;

@Schema({ collection: 'marketing_prompts', timestamps: true })
export class MarketingPrompt extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  promptText: string;

  @Prop({ default: 'general' })
  network: 'linkedin' | 'instagram' | 'tiktok' | 'general';

  @Prop({ trim: true })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  userId: string;
}

export const MarketingPromptSchema =
  SchemaFactory.createForClass(MarketingPrompt);

MarketingPromptSchema.index({ workspaceId: 1 });
MarketingPromptSchema.index({ workspaceId: 1, network: 1 });
MarketingPromptSchema.index({ workspaceId: 1, category: 1 });
MarketingPromptSchema.index({ workspaceId: 1, createdAt: -1 });
