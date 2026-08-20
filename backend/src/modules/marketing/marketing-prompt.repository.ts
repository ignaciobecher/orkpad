import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import {
  MarketingPrompt,
  MarketingPromptDocument,
} from './marketing-prompt.schema';

@Injectable()
export class MarketingPromptRepository extends BaseRepository<MarketingPromptDocument> {
  constructor(
    @InjectModel(MarketingPrompt.name)
    private readonly marketingPromptModel: Model<MarketingPromptDocument>,
  ) {
    super(marketingPromptModel);
  }
}
