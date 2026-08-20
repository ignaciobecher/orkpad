import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type PushSubscriptionDocument = HydratedDocument<PushSubscription>;

@Schema({ collection: 'push-subscriptions', timestamps: true })
export class PushSubscription extends BaseSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true })
  p256dh: string;

  @Prop({ required: true })
  auth: string;

  @Prop({ trim: true })
  userAgent?: string;
}

export const PushSubscriptionSchema =
  SchemaFactory.createForClass(PushSubscription);

PushSubscriptionSchema.index({ workspaceId: 1 });
PushSubscriptionSchema.index({ workspaceId: 1, userId: 1 });
PushSubscriptionSchema.index({ workspaceId: 1, createdAt: -1 });
