import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Subscription, SubscriptionDocument } from './subscriptions.schema';

@Injectable()
export class SubscriptionsRepository extends BaseRepository<SubscriptionDocument> {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {
    super(subscriptionModel);
  }
}
