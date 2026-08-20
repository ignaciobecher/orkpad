import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ collection: 'clients', timestamps: true })
export class Client extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ default: 'active' })
  status: 'active' | 'archived';

  @Prop({ trim: true })
  notes: string;

  @Prop({ default: false })
  isDemo: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

ClientSchema.index({ workspaceId: 1 });
ClientSchema.index({ workspaceId: 1, status: 1 });
ClientSchema.index({ workspaceId: 1, createdAt: -1 });
ClientSchema.index({ workspaceId: 1, isDemo: 1 });
