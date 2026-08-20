import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { LeadCampaign, LeadCampaignDocument } from './lead-campaigns.schema';

@Injectable()
export class LeadCampaignsRepository extends BaseRepository<LeadCampaignDocument> {
  constructor(
    @InjectModel(LeadCampaign.name)
    private readonly leadCampaignModel: Model<LeadCampaignDocument>,
  ) {
    super(leadCampaignModel);
  }
}
