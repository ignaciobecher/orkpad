import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type ProjectShareDocument = HydratedDocument<ProjectShare>;

@Schema({ collection: 'project-shares', timestamps: true })
export class ProjectShare extends BaseSchema {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true, trim: true, maxlength: 80 })
  label: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  username: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ type: Object, default: {} })
  permissions: {
    canCreate?: boolean;
    canEdit?: boolean;
    canComment?: boolean;
    canUpload?: boolean;
  };

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({ type: Date, default: null })
  lastAccessAt: Date | null;
}

export const ProjectShareSchema =
  SchemaFactory.createForClass(ProjectShare);

ProjectShareSchema.index({ workspaceId: 1, projectId: 1 });
