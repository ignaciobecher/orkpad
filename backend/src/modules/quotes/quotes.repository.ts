import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Quote, QuoteDocument } from './quotes.schema';

@Injectable()
export class QuotesRepository extends BaseRepository<QuoteDocument> {
  constructor(
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
  ) {
    super(quoteModel);
  }
}
