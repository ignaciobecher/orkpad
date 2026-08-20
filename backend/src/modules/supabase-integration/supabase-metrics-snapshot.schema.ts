import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type SupabaseMetricsSnapshotDocument =
  HydratedDocument<SupabaseMetricsSnapshot>;

@Schema({ collection: 'supabase-metrics-snapshots', timestamps: true })
export class SupabaseMetricsSnapshot extends BaseSchema {
  @Prop({ required: true })
  orkpadProjectId: string;

  @Prop({ required: true })
  supabaseProjectRef: string;

  @Prop({ type: Date, required: true })
  snapshotAt: Date;

  @Prop({ type: Object, default: {} })
  metrics: Record<string, number>;
}

export const SupabaseMetricsSnapshotSchema = SchemaFactory.createForClass(
  SupabaseMetricsSnapshot,
);

SupabaseMetricsSnapshotSchema.index({ workspaceId: 1, snapshotAt: -1 });
SupabaseMetricsSnapshotSchema.index({
  workspaceId: 1,
  supabaseProjectRef: 1,
  snapshotAt: -1,
});
