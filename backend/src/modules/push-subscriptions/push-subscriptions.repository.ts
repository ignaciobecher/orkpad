import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from './push-subscriptions.schema';

@Injectable()
export class PushSubscriptionsRepository extends BaseRepository<PushSubscriptionDocument> {
  constructor(
    @InjectModel(PushSubscription.name)
    private readonly psModel: Model<PushSubscriptionDocument>,
  ) {
    super(psModel);
  }

  async findAllByUser(
    workspaceId: string,
    userId: string,
  ): Promise<PushSubscriptionDocument[]> {
    return this.model.find({ workspaceId, userId, isDeleted: false }).exec();
  }

  async upsertByEndpoint(
    workspaceId: string,
    userId: string,
    data: {
      endpoint: string;
      p256dh: string;
      auth: string;
      userAgent?: string;
    },
  ): Promise<PushSubscriptionDocument> {
    const existing = await this.model
      .findOne({
        workspaceId,
        userId,
        endpoint: data.endpoint,
        isDeleted: false,
      })
      .exec();

    if (existing) {
      return this.model
        .findByIdAndUpdate(
          existing._id,
          {
            $set: {
              p256dh: data.p256dh,
              auth: data.auth,
              userAgent: data.userAgent,
            },
          },
          { new: true },
        )
        .exec() as Promise<PushSubscriptionDocument>;
    }

    return this.create(workspaceId, { userId, ...data });
  }

  async deleteByEndpoint(
    workspaceId: string,
    userId: string,
    endpoint: string,
  ): Promise<void> {
    await this.model
      .findOneAndUpdate(
        { workspaceId, userId, endpoint, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();
  }

  async deleteExpiredEndpoint(
    workspaceId: string,
    endpoint: string,
  ): Promise<void> {
    await this.model
      .findOneAndUpdate(
        { workspaceId, endpoint, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();
  }
}
