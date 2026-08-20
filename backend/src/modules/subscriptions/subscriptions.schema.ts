import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ collection: 'subscriptions', timestamps: true })
export class Subscription extends BaseSchema {
  @Prop({ required: true })
  clientId: string;

  @Prop()
  productId: string;

  @Prop({ required: true })
  planName: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 'monthly' })
  billingCycle: 'monthly' | 'yearly';

  @Prop({ default: 'active' })
  status: 'active' | 'past_due' | 'canceled';

  @Prop({ required: true, type: Date })
  nextBillingDate: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ workspaceId: 1 });
SubscriptionSchema.index({ workspaceId: 1, status: 1 });
SubscriptionSchema.index({ workspaceId: 1, clientId: 1 });
SubscriptionSchema.index({ workspaceId: 1, nextBillingDate: 1 });
SubscriptionSchema.index({ workspaceId: 1, createdAt: -1 });
