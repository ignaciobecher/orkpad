import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type RailwayConnectionDocument = HydratedDocument<RailwayConnection>;

@Schema({ collection: 'railway-connections', timestamps: true })
export class RailwayConnection extends BaseSchema {
  @Prop({ required: true })
  apiToken: string;

  @Prop({ type: String, default: null })
  railwayTeamId: string | null;

  @Prop({ type: Date, default: () => new Date() })
  connectedAt: Date;

  @Prop({ default: false })
  tokenInvalid: boolean;

  @Prop({ type: Date, default: null })
  lastErrorAt: Date | null;

  @Prop({ default: 0 })
  consecutiveErrorCount: number;
}

export const RailwayConnectionSchema =
  SchemaFactory.createForClass(RailwayConnection);

RailwayConnectionSchema.index(
  { workspaceId: 1 },
  { unique: true, sparse: true },
);
