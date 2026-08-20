import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type NetlifyConnectionDocument = HydratedDocument<NetlifyConnection>;

@Schema({ collection: 'netlify-connections', timestamps: true })
export class NetlifyConnection extends BaseSchema {
  @Prop({ required: true })
  apiToken: string;

  @Prop({ type: Date, default: () => new Date() })
  connectedAt: Date;

  @Prop({ default: false })
  tokenInvalid: boolean;

  @Prop({ type: Date, default: null })
  lastErrorAt: Date | null;

  @Prop({ default: 0 })
  consecutiveErrorCount: number;
}

export const NetlifyConnectionSchema =
  SchemaFactory.createForClass(NetlifyConnection);

NetlifyConnectionSchema.index(
  { workspaceId: 1 },
  { unique: true, sparse: true },
);
