import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  NetlifyDeploymentSnapshot,
  NetlifyDeploymentSnapshotDocument,
} from './netlify-deployment-snapshot.schema';

@Injectable()
export class NetlifyDeploymentSnapshotRepository extends BaseRepository<NetlifyDeploymentSnapshotDocument> {
  constructor(
    @InjectModel(NetlifyDeploymentSnapshot.name)
    private readonly snapshotModel: Model<NetlifyDeploymentSnapshotDocument>,
  ) {
    super(snapshotModel);
  }

  async upsertDeployment(
    workspaceId: string,
    data: {
      orkpadProjectId: string;
      netlifySiteId: string;
      netlifyDeployId: string;
      siteName: string;
      status: string;
      branch: string | null;
      errorMessage: string | null;
      deployTime: number | null;
      deployedAt: Date;
    },
  ): Promise<void> {
    const { status, errorMessage, ...rest } = data;
    await this.snapshotModel
      .updateOne(
        { workspaceId, netlifyDeployId: data.netlifyDeployId },
        {
          $setOnInsert: {
            ...rest,
            workspaceId,
            isDeleted: false,
            deletedAt: null,
          },
          $set: { status, errorMessage },
        },
        { upsert: true },
      )
      .exec();
  }

  async pruneOlderThan(cutoff: Date): Promise<void> {
    await this.snapshotModel.deleteMany({ deployedAt: { $lt: cutoff } }).exec();
  }

  async getStats(workspaceId: string, since: Date) {
    return this.snapshotModel
      .aggregate([
        {
          $match: {
            workspaceId,
            isDeleted: false,
            deployedAt: { $gte: since },
          },
        },
        {
          $group: {
            _id: {
              day: {
                $dateToString: { format: '%Y-%m-%d', date: '$deployedAt' },
              },
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
  }

  async getActiveSiteIds(workspaceId: string, since: Date): Promise<string[]> {
    const rows = await this.snapshotModel
      .aggregate([
        {
          $match: {
            workspaceId,
            isDeleted: false,
            deployedAt: { $gte: since },
          },
        },
        { $group: { _id: '$netlifySiteId' } },
      ])
      .exec();
    return rows.map((r) => r._id);
  }
}
