import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '../clients/clients.module';
import { ProductsModule } from '../products/products.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsRepository } from './subscriptions.repository';
import { Subscription, SubscriptionSchema } from './subscriptions.schema';
import {
  SubscriptionPayment,
  SubscriptionPaymentSchema,
} from './subscription-payments.schema';
import { SubscriptionPaymentsRepository } from './subscription-payments.repository';
import { SubscriptionPaymentsService } from './subscription-payments.service';
import { SubscriptionPaymentsController } from './subscription-payments.controller';

@Module({
  imports: [
    ClientsModule,
    ProductsModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: SubscriptionPayment.name, schema: SubscriptionPaymentSchema },
    ]),
  ],
  controllers: [SubscriptionsController, SubscriptionPaymentsController],
  providers: [
    SubscriptionsService,
    SubscriptionsRepository,
    SubscriptionPaymentsRepository,
    SubscriptionPaymentsService,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
