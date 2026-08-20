import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  SupabaseMetricsSnapshot,
  SupabaseMetricsSnapshotDocument,
} from './supabase-metrics-snapshot.schema';

@Injectable()
export class SupabaseMetricsSnapshotRepository extends BaseRepository<SupabaseMetricsSnapshotDocument> {
  constructor(
    @InjectModel(SupabaseMetricsSnapshot.name)
    private readonly snapshotModel: Model<SupabaseMetricsSnapshotDocument>,
  ) {
    super(snapshotModel);
  }

  async saveSnapshot(
    workspaceId: string,
    data: {
      orkpadProjectId: string;
      supabaseProjectRef: string;
      metrics: Record<string, number>;
    },
  ): Promise<SupabaseMetricsSnapshotDocument> {
    return this.snapshotModel.create({
      workspaceId,
      ...data,
      snapshotAt: new Date(),
    });
  }

  async getLatestByProject(
    workspaceId: string,
    supabaseProjectRef: string,
    limit = 288,
  ): Promise<SupabaseMetricsSnapshotDocument[]> {
    return this.snapshotModel
      .find({ workspaceId, supabaseProjectRef, isDeleted: false })
      .sort({ snapshotAt: -1 })
      .limit(limit)
      .exec();
  }

  async pruneOlderThan(cutoff: Date): Promise<void> {
    await this.snapshotModel
      .updateMany(
        { snapshotAt: { $lt: cutoff }, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();
  }
}
