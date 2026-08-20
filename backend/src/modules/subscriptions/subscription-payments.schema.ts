import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type SubscriptionPaymentDocument = HydratedDocument<SubscriptionPayment>;

@Schema({ collection: 'subscription_payments', timestamps: true })
export class SubscriptionPayment extends BaseSchema {
  @Prop({ required: true })
  subscriptionId: string;

  @Prop({ required: true, trim: true })
  periodLabel: string;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ default: 'pending' })
  status: 'pending' | 'paid';

  @Prop({ default: 0 })
  amount: number;

  @Prop({ default: 'USD', trim: true, uppercase: true })
  currency: string;

  @Prop({ trim: true, default: '' })
  notes: string;
}

export const SubscriptionPaymentSchema =
  SchemaFactory.createForClass(SubscriptionPayment);

SubscriptionPaymentSchema.index({ workspaceId: 1, subscriptionId: 1 });
SubscriptionPaymentSchema.index({ workspaceId: 1, status: 1 });
SubscriptionPaymentSchema.index({ workspaceId: 1, dueDate: 1 });
SubscriptionPaymentSchema.index({
  workspaceId: 1,
  subscriptionId: 1,
  dueDate: -1,
});
