import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  RailwayConnection,
  RailwayConnectionDocument,
} from './railway-integration.schema';

@Injectable()
export class RailwayIntegrationRepository extends BaseRepository<RailwayConnectionDocument> {
  constructor(
    @InjectModel(RailwayConnection.name)
    private readonly railwayConnectionModel: Model<RailwayConnectionDocument>,
  ) {
    super(railwayConnectionModel);
  }

  async findByWorkspace(
    workspaceId: string,
  ): Promise<RailwayConnectionDocument | null> {
    return this.railwayConnectionModel
      .findOne({ workspaceId, isDeleted: false })
      .exec();
  }

  async softDeleteByWorkspace(
    workspaceId: string,
  ): Promise<RailwayConnectionDocument | null> {
    return this.railwayConnectionModel
      .findOneAndUpdate(
        { workspaceId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async upsertByWorkspace(
    workspaceId: string,
    data: { apiToken: string; railwayTeamId?: string | null },
  ): Promise<RailwayConnectionDocument> {
    return this.railwayConnectionModel
      .findOneAndUpdate(
        { workspaceId },
        {
          $set: {
            ...data,
            workspaceId,
            isDeleted: false,
            deletedAt: null,
            connectedAt: new Date(),
            tokenInvalid: false,
            lastErrorAt: null,
            consecutiveErrorCount: 0,
          },
        },
        { upsert: true, returnDocument: 'after' },
      )
      .exec();
  }

  async markError(
    workspaceId: string,
  ): Promise<RailwayConnectionDocument | null> {
    return this.railwayConnectionModel
      .findOneAndUpdate(
        { workspaceId, isDeleted: false },
        {
          $set: { lastErrorAt: new Date() },
          $inc: { consecutiveErrorCount: 1 },
        },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async markTokenInvalid(workspaceId: string): Promise<void> {
    await this.railwayConnectionModel
      .updateOne(
        { workspaceId, isDeleted: false },
        { $set: { tokenInvalid: true } },
      )
      .exec();
  }

  async markHealthy(workspaceId: string): Promise<void> {
    await this.railwayConnectionModel
      .updateOne(
        { workspaceId, isDeleted: false },
        {
          $set: {
            tokenInvalid: false,
            consecutiveErrorCount: 0,
            lastErrorAt: null,
          },
        },
      )
      .exec();
  }
}
