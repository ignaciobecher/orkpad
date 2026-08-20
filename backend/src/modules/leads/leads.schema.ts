import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type LeadDocument = HydratedDocument<Lead>;

export type LeadOpportunity =
  | 'no_website'
  | 'bad_seo'
  | 'no_social'
  | 'low_rating'
  | 'no_https'
  | 'outdated_web'
  | 'no_email';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'disqualified'
  | 'converted';
export type LeadSource = 'google_maps' | 'manual' | 'import';
export type LeadEmailSource =
  | 'homepage'
  | 'contact_page'
  | 'about_page'
  | 'inferred'
  | 'manual';
export type LeadEmailConfidence = 'high' | 'medium' | 'low';

@Schema({ collection: 'leads', timestamps: true })
export class Lead extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  industry?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  emailSource?: LeadEmailSource;

  @Prop({ trim: true })
  emailConfidence?: LeadEmailConfidence;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  whatsapp?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  instagram?: string;

  @Prop({ trim: true })
  facebook?: string;

  @Prop({ trim: true })
  linkedin?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  province?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ type: { lat: Number, lng: Number }, default: null })
  coordinates?: { lat: number; lng: number } | null;

  @Prop({ trim: true })
  googlePlaceId?: string;

  @Prop({ trim: true })
  googleMapsUrl?: string;

  @Prop({ type: Number })
  googleRating?: number;

  @Prop({ type: Number })
  googleReviewCount?: number;

  @Prop({ type: [String], default: [] })
  opportunities: LeadOpportunity[];

  @Prop({ default: 0, min: 0, max: 100 })
  score: number;

  @Prop({ default: 'new' })
  status: LeadStatus;

  @Prop({ trim: true })
  searchId?: string;

  @Prop({ trim: true })
  campaignId?: string;

  @Prop({ type: Date })
  lastContactedAt?: Date;

  @Prop({ default: 'google_maps' })
  source: LeadSource;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ trim: true })
  notes?: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.index({ workspaceId: 1 });
LeadSchema.index({ workspaceId: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, score: -1 });
LeadSchema.index({ workspaceId: 1, industry: 1 });
LeadSchema.index({ workspaceId: 1, city: 1 });
LeadSchema.index({ workspaceId: 1, searchId: 1 });
LeadSchema.index({ workspaceId: 1, createdAt: -1 });
