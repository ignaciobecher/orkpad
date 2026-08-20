import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { PushSubscriptionsRepository } from './push-subscriptions.repository';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from './push-subscriptions.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
    ]),
  ],
  controllers: [PushSubscriptionsController],
  providers: [PushSubscriptionsService, PushSubscriptionsRepository],
  exports: [PushSubscriptionsService],
})
export class PushSubscriptionsModule {}
