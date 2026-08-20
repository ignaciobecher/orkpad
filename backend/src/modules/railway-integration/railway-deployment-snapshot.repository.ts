import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  RailwayDeploymentSnapshot,
  RailwayDeploymentSnapshotDocument,
} from './railway-deployment-snapshot.schema';

@Injectable()
export class RailwayDeploymentSnapshotRepository extends BaseRepository<RailwayDeploymentSnapshotDocument> {
  constructor(
    @InjectModel(RailwayDeploymentSnapshot.name)
    private readonly snapshotModel: Model<RailwayDeploymentSnapshotDocument>,
  ) {
    super(snapshotModel);
  }

  async upsertDeployment(
    workspaceId: string,
    data: {
      orkpadProjectId: string;
      railwayProjectId: string;
      railwayDeploymentId: string;
      serviceId: string;
      serviceName: string;
      status: string;
      deployedAt: Date;
    },
  ): Promise<void> {
    const { status, ...rest } = data;
    await this.snapshotModel
      .updateOne(
        { workspaceId, railwayDeploymentId: data.railwayDeploymentId },
        {
          $setOnInsert: {
            ...rest,
            workspaceId,
            isDeleted: false,
            deletedAt: null,
          },
          $set: { status },
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

  async getActiveServiceIds(
    workspaceId: string,
    since: Date,
  ): Promise<string[]> {
    const rows = await this.snapshotModel
      .aggregate([
        {
          $match: {
            workspaceId,
            isDeleted: false,
            deployedAt: { $gte: since },
          },
        },
        { $group: { _id: '$serviceId' } },
      ])
      .exec();
    return rows.map((r) => r._id);
  }
}
