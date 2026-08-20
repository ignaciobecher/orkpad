import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  SubscriptionPayment,
  SubscriptionPaymentDocument,
} from './subscription-payments.schema';

@Injectable()
export class SubscriptionPaymentsRepository extends BaseRepository<SubscriptionPaymentDocument> {
  constructor(
    @InjectModel(SubscriptionPayment.name)
    private readonly paymentModel: Model<SubscriptionPaymentDocument>,
  ) {
    super(paymentModel);
  }

  async findBySubscription(
    workspaceId: string,
    subscriptionId: string,
  ): Promise<SubscriptionPaymentDocument[]> {
    return this.paymentModel
      .find({ workspaceId, subscriptionId, isDeleted: false })
      .sort({ dueDate: -1 })
      .exec();
  }

  async findLastPaid(
    workspaceId: string,
    subscriptionId: string,
  ): Promise<SubscriptionPaymentDocument | null> {
    return this.paymentModel
      .findOne({
        workspaceId,
        subscriptionId,
        status: 'paid',
        isDeleted: false,
      })
      .sort({ paidAt: -1 })
      .exec();
  }

  async findLastPaidBulk(
    workspaceId: string,
    subscriptionIds: string[],
  ): Promise<Record<string, Date | null>> {
    if (!subscriptionIds.length) return {};

    const results = await this.paymentModel
      .aggregate([
        {
          $match: {
            workspaceId,
            subscriptionId: { $in: subscriptionIds },
            status: 'paid',
            isDeleted: false,
          },
        },
        { $sort: { paidAt: -1 } },
        {
          $group: {
            _id: '$subscriptionId',
            lastPaidAt: { $first: '$paidAt' },
          },
        },
      ])
      .exec();

    const map: Record<string, Date | null> = {};
    for (const r of results) {
      map[r._id] = r.lastPaidAt ?? null;
    }
    return map;
  }
}
