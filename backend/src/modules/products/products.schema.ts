import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ collection: 'products', timestamps: true })
export class Product extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 'active' })
  status: 'active' | 'archived';

  @Prop({ default: 'service' })
  type: 'service' | 'digital' | 'physical';
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ workspaceId: 1 });
ProductSchema.index({ workspaceId: 1, status: 1 });
ProductSchema.index({ workspaceId: 1, createdAt: -1 });
