import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  NetlifyConnection,
  NetlifyConnectionDocument,
} from './netlify-integration.schema';

@Injectable()
export class NetlifyIntegrationRepository extends BaseRepository<NetlifyConnectionDocument> {
  constructor(
    @InjectModel(NetlifyConnection.name)
    private readonly netlifyConnectionModel: Model<NetlifyConnectionDocument>,
  ) {
    super(netlifyConnectionModel);
  }

  async findByWorkspace(
    workspaceId: string,
  ): Promise<NetlifyConnectionDocument | null> {
    return this.netlifyConnectionModel
      .findOne({ workspaceId, isDeleted: false })
      .exec();
  }

  async softDeleteByWorkspace(
    workspaceId: string,
  ): Promise<NetlifyConnectionDocument | null> {
    return this.netlifyConnectionModel
      .findOneAndUpdate(
        { workspaceId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async upsertByWorkspace(
    workspaceId: string,
    data: { apiToken: string },
  ): Promise<NetlifyConnectionDocument> {
    return this.netlifyConnectionModel
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
  ): Promise<NetlifyConnectionDocument | null> {
    return this.netlifyConnectionModel
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
    await this.netlifyConnectionModel
      .updateOne(
        { workspaceId, isDeleted: false },
        { $set: { tokenInvalid: true } },
      )
      .exec();
  }

  async markHealthy(workspaceId: string): Promise<void> {
    await this.netlifyConnectionModel
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
