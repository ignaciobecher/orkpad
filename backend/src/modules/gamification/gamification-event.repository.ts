import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaseRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../common/base/base.repository';
import {
  GamificationEvent,
  GamificationEventDocument,
  GamificationEventType,
} from './gamification-event.schema';

@Injectable()
export class GamificationEventRepository extends BaseRepository<GamificationEventDocument> {
  constructor(
    @InjectModel(GamificationEvent.name)
    private readonly eventModel: Model<GamificationEventDocument>,
  ) {
    super(eventModel);
  }

  async createIfNotExists(
    workspaceId: string,
    userId: string,
    data: {
      type: GamificationEventType;
      points: number;
      refId: string;
      refType: string;
    },
  ): Promise<GamificationEventDocument | null> {
    const exists = await this.eventModel
      .findOne({
        workspaceId,
        refType: data.refType,
        refId: data.refId,
        isDeleted: false,
      })
      .exec();
    if (exists) return null;

    return this.eventModel.create({ ...data, workspaceId, userId });
  }

  async deleteByRef(
    workspaceId: string,
    refType: string,
    refId: string,
  ): Promise<GamificationEventDocument | null> {
    return this.eventModel
      .findOneAndUpdate(
        { workspaceId, refType, refId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async findHistory(
    workspaceId: string,
    userId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<GamificationEventDocument>> {
    return this.findAll(
      workspaceId,
      { userId },
      { sort: { createdAt: -1 }, ...options },
    );
  }

  async hasActivityOn(
    workspaceId: string,
    userId: string,
    dateKey: string,
  ): Promise<boolean> {
    return this.exists(workspaceId, {
      userId,
      createdAt: {
        $gte: new Date(`${dateKey}T00:00:00.000Z`),
        $lt: new Date(`${dateKey}T23:59:59.999Z`),
      },
    });
  }
}
