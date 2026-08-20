import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type RailwayDeploymentSnapshotDocument =
  HydratedDocument<RailwayDeploymentSnapshot>;

@Schema({ collection: 'railway-deployment-snapshots', timestamps: true })
export class RailwayDeploymentSnapshot extends BaseSchema {
  @Prop({ required: true })
  orkpadProjectId: string;

  @Prop({ required: true })
  railwayProjectId: string;

  @Prop({ required: true })
  railwayDeploymentId: string;

  @Prop({ required: true })
  serviceId: string;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: Date, required: true })
  deployedAt: Date;
}

export const RailwayDeploymentSnapshotSchema = SchemaFactory.createForClass(
  RailwayDeploymentSnapshot,
);

RailwayDeploymentSnapshotSchema.index({ workspaceId: 1, deployedAt: -1 });
RailwayDeploymentSnapshotSchema.index(
  { workspaceId: 1, railwayDeploymentId: 1 },
  { unique: true },
);
