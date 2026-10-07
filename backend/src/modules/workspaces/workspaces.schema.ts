import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkspaceDocument = HydratedDocument<Workspace>;

// Workspaces are the root tenant object — they do not have a workspaceId themselves.
@Schema({ collection: 'workspaces', timestamps: true })
export class Workspace {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ type: String, trim: true, maxlength: 80, default: null })
  displayName: string | null;

  @Prop({ type: String, default: null })
  logoFileId: string | null;

  @Prop({ type: String, trim: true, default: null })
  primaryColor: string | null;

  @Prop({ type: String, default: null })
  defaultTheme: 'dark' | 'light' | null;

  @Prop({ default: 'active' })
  status: 'active' | 'suspended';

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);

WorkspaceSchema.index({ ownerId: 1 });
