import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type SupabaseConnectionDocument = HydratedDocument<SupabaseConnection>;

@Schema({ collection: 'supabase-connections', timestamps: true })
export class SupabaseConnection extends BaseSchema {
  @Prop({ required: true })
  personalAccessToken: string;

  @Prop({ required: true })
  serviceRoleKey: string;

  @Prop({ type: Date, default: () => new Date() })
  connectedAt: Date;

  @Prop({ default: false })
  tokenInvalid: boolean;

  @Prop({ type: Date, default: null })
  lastErrorAt: Date | null;

  @Prop({ default: 0 })
  consecutiveErrorCount: number;
}

export const SupabaseConnectionSchema =
  SchemaFactory.createForClass(SupabaseConnection);

SupabaseConnectionSchema.index(
  { workspaceId: 1 },
  { unique: true, sparse: true },
);
