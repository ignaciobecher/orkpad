import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type AiSettingsDocument = HydratedDocument<AiSettings>;

@Schema({ collection: 'ai_settings', timestamps: true })
export class AiSettings extends BaseSchema {
  @Prop({ default: true })
  enabled: boolean;

  @Prop({ type: String, default: null })
  ollamaBaseUrl: string | null;

  @Prop({ type: String, default: null })
  chatModel: string | null;

  @Prop({ type: String, default: null })
  embedModel: string | null;

  @Prop({ type: Number, default: 0.3 })
  temperature: number;

  @Prop({ type: String, default: null })
  systemPrompt: string | null;

  @Prop({ type: [String], default: ['note', 'doc', 'task', 'project', 'invoice'] })
  indexTypes: string[];
}

export const AiSettingsSchema = SchemaFactory.createForClass(AiSettings);
