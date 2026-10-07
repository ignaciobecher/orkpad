import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../common/base/base.schema';

export type PaymentMethodDocument = HydratedDocument<PaymentMethod>;

@Schema({ collection: 'payment-methods', timestamps: true })
export class PaymentMethod extends BaseSchema {
  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  isDemo: boolean;
}

export const PaymentMethodSchema =
  SchemaFactory.createForClass(PaymentMethod);

PaymentMethodSchema.index({ workspaceId: 1 });
PaymentMethodSchema.index({ workspaceId: 1, active: 1 });
PaymentMethodSchema.index(
  { workspaceId: 1, name: 1 },
  { unique: true, collation: { locale: 'es', strength: 2 } },
);
