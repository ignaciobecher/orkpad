import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type ProjectLinkCredentialDocument =
  HydratedDocument<ProjectLinkCredential>;

@Schema({ collection: 'project_link_credentials', timestamps: true })
export class ProjectLinkCredential extends BaseSchema {
  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: [String], default: ['view', 'create-task'] })
  permissions: string[];

  @Prop({ default: 0 })
  failedAttempts: number;

  @Prop({ type: Date, default: null })
  lockedUntil: Date | null;

  @Prop({ type: Date, default: null })
  lastSuccessAt: Date | null;
}

export const ProjectLinkCredentialSchema = SchemaFactory.createForClass(
  ProjectLinkCredential,
);

ProjectLinkCredentialSchema.index(
  { workspaceId: 1, projectId: 1 },
  { unique: false, sparse: true },
);
ProjectLinkCredentialSchema.index({ workspaceId: 1 });
