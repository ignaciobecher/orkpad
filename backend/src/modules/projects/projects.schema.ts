import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ collection: 'projects', timestamps: true })
export class Project extends BaseSchema {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  clientId: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: 'active' })
  status: 'active' | 'on-hold' | 'completed' | 'archived';

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ default: 0 })
  budget: number;

  @Prop({ default: 'USD', trim: true, uppercase: true })
  currency: string;

  @Prop({ type: String, default: null })
  publicToken: string | null;

  @Prop({ default: 'public' })
  linkVisibility: 'public' | 'private';

  @Prop({ type: Date, default: null })
  linkExpiresAt: Date | null;

  @Prop({
    type: [
      {
        owner: { type: String },
        repo: { type: String },
        defaultBranch: { type: String },
        htmlUrl: { type: String },
      },
    ],
    default: [],
  })
  githubRepos: {
    owner: string;
    repo: string;
    defaultBranch: string;
    htmlUrl: string;
  }[];

  @Prop({ default: false })
  isDemo: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ workspaceId: 1, status: 1 });
ProjectSchema.index({ workspaceId: 1, clientId: 1 });
ProjectSchema.index({ workspaceId: 1, createdAt: -1 });
ProjectSchema.index({ publicToken: 1 }, { sparse: true });
ProjectSchema.index({ workspaceId: 1, linkVisibility: 1 });
ProjectSchema.index({ workspaceId: 1, isDemo: 1 });
