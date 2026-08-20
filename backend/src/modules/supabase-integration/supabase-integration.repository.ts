import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  SupabaseConnection,
  SupabaseConnectionDocument,
} from './supabase-integration.schema';

@Injectable()
export class SupabaseIntegrationRepository extends BaseRepository<SupabaseConnectionDocument> {
  constructor(
    @InjectModel(SupabaseConnection.name)
    private readonly supabaseConnectionModel: Model<SupabaseConnectionDocument>,
  ) {
    super(supabaseConnectionModel);
  }

  async findByWorkspace(
    workspaceId: string,
  ): Promise<SupabaseConnectionDocument | null> {
    return this.supabaseConnectionModel
      .findOne({ workspaceId, isDeleted: false })
      .exec();
  }

  async softDeleteByWorkspace(
    workspaceId: string,
  ): Promise<SupabaseConnectionDocument | null> {
    return this.supabaseConnectionModel
      .findOneAndUpdate(
        { workspaceId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async upsertByWorkspace(
    workspaceId: string,
    data: { personalAccessToken: string; serviceRoleKey: string },
  ): Promise<SupabaseConnectionDocument> {
    return this.supabaseConnectionModel
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
  ): Promise<SupabaseConnectionDocument | null> {
    return this.supabaseConnectionModel
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
    await this.supabaseConnectionModel
      .updateOne(
        { workspaceId, isDeleted: false },
        { $set: { tokenInvalid: true } },
      )
      .exec();
  }

  async markHealthy(workspaceId: string): Promise<void> {
    await this.supabaseConnectionModel
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
