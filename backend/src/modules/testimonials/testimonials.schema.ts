import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ collection: 'testimonials', timestamps: true })
export class Testimonial extends BaseSchema {
  @Prop({ required: true, trim: true })
  clientName: string;

  @Prop({ trim: true })
  clientRole?: string;

  @Prop()
  clientAvatarUrl?: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  content: string;

  @Prop({ type: Number, min: 1, max: 5 })
  rating?: number;

  @Prop({ type: String, default: null })
  projectId?: string | null;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

TestimonialSchema.index({ workspaceId: 1 });
TestimonialSchema.index({ workspaceId: 1, isPublic: 1 });
TestimonialSchema.index({ workspaceId: 1, createdAt: -1 });
