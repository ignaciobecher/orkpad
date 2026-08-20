import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema({ _id: false })
class SocialLinks {
  @Prop()
  website?: string;

  @Prop()
  linkedin?: string;

  @Prop()
  twitter?: string;

  @Prop()
  github?: string;
}

@Schema({ _id: false })
class PortfolioStats {
  @Prop()
  yearsExperience?: number;

  @Prop()
  completedProjects?: number;

  @Prop()
  happyClients?: number;
}

// Workspaces are the root tenant object — they do not have a workspaceId themselves.
@Schema({ collection: 'workspaces', timestamps: true })
export class Workspace {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ default: 'active' })
  status: 'active' | 'suspended';

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ trim: true, maxlength: 500 })
  bio?: string;

  @Prop({ trim: true, maxlength: 120 })
  headline?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  bannerUrl?: string;

  @Prop({ default: false })
  publicProfile: boolean;

  @Prop({ type: SocialLinks, default: {} })
  socialLinks: SocialLinks;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: false })
  availableForWork: boolean;

  @Prop({ trim: true, maxlength: 80 })
  availabilityNote?: string;

  @Prop({ type: PortfolioStats, default: {} })
  portfolioStats: PortfolioStats;

  createdAt: Date;
  updatedAt: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);

WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ publicProfile: 1 });
