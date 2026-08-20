import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type NetlifyDeploymentSnapshotDocument =
  HydratedDocument<NetlifyDeploymentSnapshot>;

@Schema({ collection: 'netlify-deployment-snapshots', timestamps: true })
export class NetlifyDeploymentSnapshot extends BaseSchema {
  @Prop({ required: true })
  orkpadProjectId: string;

  @Prop({ required: true })
  netlifySiteId: string;

  @Prop({ required: true })
  netlifyDeployId: string;

  @Prop({ required: true })
  siteName: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: String, default: null })
  branch: string | null;

  @Prop({ type: String, default: null })
  errorMessage: string | null;

  @Prop({ type: Number, default: null })
  deployTime: number | null;

  @Prop({ type: Date, required: true })
  deployedAt: Date;
}

export const NetlifyDeploymentSnapshotSchema = SchemaFactory.createForClass(
  NetlifyDeploymentSnapshot,
);

NetlifyDeploymentSnapshotSchema.index({ workspaceId: 1, deployedAt: -1 });
NetlifyDeploymentSnapshotSchema.index(
  { workspaceId: 1, netlifyDeployId: 1 },
  { unique: true },
);
