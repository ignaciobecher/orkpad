import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceDocument = HydratedDocument<Resource>;

@Schema({ collection: 'resources', timestamps: true })
export class Resource {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ trim: true })
  excerpt: string;

  @Prop({ type: String, default: null })
  categoryId: string | null;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, default: null })
  coverImageUrl: string | null;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: Date, default: null })
  publishedAt: Date | null;

  @Prop({ type: Number, default: null })
  readTimeMinutes: number | null;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.index({ slug: 1 }, { unique: true });
ResourceSchema.index({ isPublished: 1, createdAt: -1 });
ResourceSchema.index({ categoryId: 1, isPublished: 1 });
ResourceSchema.index({ tags: 1 });
