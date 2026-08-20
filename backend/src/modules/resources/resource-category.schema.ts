import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceCategoryDocument = HydratedDocument<ResourceCategory>;

@Schema({ collection: 'resource-categories', timestamps: true })
export class ResourceCategory {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ trim: true })
  icon: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ResourceCategorySchema =
  SchemaFactory.createForClass(ResourceCategory);

ResourceCategorySchema.index({ slug: 1 }, { unique: true });
