import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  PaymentMethod,
  PaymentMethodDocument,
} from './payment-method.schema';

@Injectable()
export class PaymentMethodsRepository extends BaseRepository<PaymentMethodDocument> {
  constructor(
    @InjectModel(PaymentMethod.name)
    private readonly paymentMethodModel: Model<PaymentMethodDocument>,
  ) {
    super(paymentMethodModel);
  }
}
