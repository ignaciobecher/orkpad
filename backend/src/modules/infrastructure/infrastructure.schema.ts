import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type InfrastructureResourceDocument =
  HydratedDocument<InfrastructureResource>;

@Schema({ collection: 'infrastructure-resources', timestamps: true })
export class InfrastructureResource extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  provider: string;

  @Prop()
  type: string;

  @Prop({ default: 'RUNNING' })
  status: 'RUNNING' | 'STOPPED' | 'ERROR';

  @Prop({ default: 0 })
  cost: number;

  @Prop({ default: 'USD' })
  currency: string;
}

export const InfrastructureResourceSchema = SchemaFactory.createForClass(
  InfrastructureResource,
);

InfrastructureResourceSchema.index({ workspaceId: 1, status: 1 });
InfrastructureResourceSchema.index({ workspaceId: 1, createdAt: -1 });
