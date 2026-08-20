import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Lead, LeadDocument } from './leads.schema';

@Injectable()
export class LeadsRepository extends BaseRepository<LeadDocument> {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
  ) {
    super(leadModel);
  }
}
